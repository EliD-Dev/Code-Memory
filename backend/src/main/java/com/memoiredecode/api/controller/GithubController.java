package com.memoiredecode.api.controller;

import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.memoiredecode.api.repository.UserRepository;
import com.memoiredecode.api.entity.UserEntity;
import com.memoiredecode.api.service.EncryptionService;
import com.memoiredecode.api.service.GithubAnalysisService;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private final WebClient webClient;
    private final GithubAnalysisService githubAnalysisService;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final com.memoiredecode.api.repository.SearchHistoryRepository searchHistoryRepository;

    public GithubController(WebClient.Builder webClientBuilder, 
                            GithubAnalysisService githubAnalysisService,
                            UserRepository userRepository,
                            EncryptionService encryptionService,
                            com.memoiredecode.api.repository.SearchHistoryRepository searchHistoryRepository) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
        this.githubAnalysisService = githubAnalysisService;
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
        this.searchHistoryRepository = searchHistoryRepository;
    }

    private void saveSearchHistory(UserEntity user, String repoFullName) {
        try {
            List<com.memoiredecode.api.entity.SearchHistoryEntity> history = 
                searchHistoryRepository.findByUserOrderBySearchDateDesc(user);
            
            com.memoiredecode.api.entity.SearchHistoryEntity existing = null;
            for (com.memoiredecode.api.entity.SearchHistoryEntity h : history) {
                if (h.getRepoFullName().equalsIgnoreCase(repoFullName)) {
                    existing = h;
                    break;
                }
            }
            
            if (existing != null) {
                existing.setSearchDate(java.time.LocalDateTime.now());
                searchHistoryRepository.save(existing);
            } else {
                com.memoiredecode.api.entity.SearchHistoryEntity newEntry = 
                    com.memoiredecode.api.entity.SearchHistoryEntity.builder()
                        .repoFullName(repoFullName)
                        .searchDate(java.time.LocalDateTime.now())
                        .user(user)
                        .build();
                searchHistoryRepository.save(newEntry);
                history.add(0, newEntry);
            }
            
            if (history.size() > 10) {
                for (int i = 10; i < history.size(); i++) {
                    searchHistoryRepository.delete(history.get(i));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @GetMapping(value = "/commits/{owner}/{repo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> getCommits(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String owner,
            @PathVariable String repo) {

        return Mono.fromCallable(() -> {
            String token = authorizedClient.getAccessToken().getTokenValue();
            if (oauth2User != null) {
                Object idAttr = oauth2User.getAttribute("id");
                if (idAttr != null) {
                    String githubId = String.valueOf(idAttr);
                    var userOpt = userRepository.findByGithubId(githubId);
                    if (userOpt.isPresent() && userOpt.get().getEncryptedGithubToken() != null) {
                        try {
                            String pat = encryptionService.decrypt(userOpt.get().getEncryptedGithubToken());
                            if (pat != null && !pat.trim().isEmpty()) {
                                token = pat;
                            }
                        } catch (Exception e) {
                            // ignore and fallback
                        }
                    }
                }
            }
            return token;
        })
        .subscribeOn(Schedulers.boundedElastic())
        .flatMap(token -> this.webClient.get()
                .uri("/repos/{owner}/{repo}/commits?per_page=50", owner, repo)
                .headers(headers -> {
                    headers.setBearerAuth(token);
                    headers.set("Accept", "application/vnd.github.v3+json");
                    headers.set("X-GitHub-Api-Version", "2022-11-28");
                })
                .retrieve()
                .bodyToMono(String.class)
        );
    }

    @GetMapping(value = "/analyze/{owner}/{repo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<org.springframework.http.ResponseEntity<Object>> analyzeRepository(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String owner,
            @PathVariable String repo) {
        
        return Mono.fromCallable(() -> {
            String token = authorizedClient.getAccessToken().getTokenValue();
            if (oauth2User != null) {
                Object idAttr = oauth2User.getAttribute("id");
                if (idAttr != null) {
                    String githubId = String.valueOf(idAttr);
                    var userOpt = userRepository.findByGithubId(githubId);
                    if (userOpt.isPresent()) {
                        UserEntity user = userOpt.get();
                        if (user.getEncryptedGithubToken() != null) {
                            try {
                                String pat = encryptionService.decrypt(user.getEncryptedGithubToken());
                                if (pat != null && !pat.trim().isEmpty()) {
                                    token = pat;
                                }
                            } catch (Exception e) {
                                // ignore and fallback
                            }
                        }
                        saveSearchHistory(user, owner + "/" + repo);
                    }
                }
            }
            return token;
        })
        .subscribeOn(Schedulers.boundedElastic())
        .flatMap(token -> this.githubAnalysisService.analyzeRepository(owner, repo, token)
                .map(res -> org.springframework.http.ResponseEntity.ok((Object) res))
                .onErrorResume(e -> {
                    e.printStackTrace();

                    String message = e.getMessage();
                    if (message == null || message.isEmpty()) {
                        message = e.toString();
                    }

                    boolean isNotFoundOrForbidden = false;
                    if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException wcre) {
                        int code = wcre.getStatusCode().value();
                        if (code == 404 || code == 403) {
                            isNotFoundOrForbidden = true;
                        }
                    } else if (message.contains("404") || message.contains("403")) {
                        isNotFoundOrForbidden = true;
                    }

                    if (isNotFoundOrForbidden) {
                        return Mono.just(org.springframework.http.ResponseEntity
                            .status(org.springframework.http.HttpStatus.valueOf(422))
                            .body((Object) java.util.Map.of(
                                "error", "REPO_NOT_FOUND",
                                "message", "REPO_NOT_FOUND_DESC"
                            )));
                    }

                    String errorKey = "ANALYSIS_FAILED_DESC";
                    if (e instanceof java.util.concurrent.TimeoutException || 
                        e.getCause() instanceof io.netty.handler.timeout.ReadTimeoutException ||
                        message.toLowerCase().contains("timeout")) {
                        errorKey = "TIMEOUT_ERROR_DESC";
                    } else if (message.contains("401") || message.contains("Unauthorized")) {
                        errorKey = "UNAUTHORIZED_ERROR_DESC";
                    } else if (message.contains("403") || message.contains("rate limit")) {
                        errorKey = "RATE_LIMIT_ERROR_DESC";
                    }

                    return Mono.just(org.springframework.http.ResponseEntity
                        .status(org.springframework.http.HttpStatus.valueOf(422))
                        .body((Object) java.util.Map.of(
                            "error", "ANALYSIS_FAILED",
                            "message", errorKey
                        )));
                })
        );
    }
}