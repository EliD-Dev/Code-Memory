package com.memoiredecode.api.controller;

import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.memoiredecode.api.service.GithubAnalysisService;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private final WebClient webClient;
    private final GithubAnalysisService githubAnalysisService;

    public GithubController(WebClient.Builder webClientBuilder, GithubAnalysisService githubAnalysisService) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
        this.githubAnalysisService = githubAnalysisService;
    }

    @GetMapping(value = "/commits/{owner}/{repo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> getCommits(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @PathVariable String owner,
            @PathVariable String repo) {

        return this.webClient.get()
                .uri("/repos/{owner}/{repo}/commits?per_page=50", owner, repo)
                .headers(headers -> {
                    headers.setBearerAuth(authorizedClient.getAccessToken().getTokenValue());
                    headers.set("Accept", "application/vnd.github.v3+json");
                    headers.set("X-GitHub-Api-Version", "2022-11-28");
                })
                .retrieve()
                .bodyToMono(String.class);
    }

    @GetMapping(value = "/analyze/{owner}/{repo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<org.springframework.http.ResponseEntity<Object>> analyzeRepository(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @PathVariable String owner,
            @PathVariable String repo) {
        try {
            return this.githubAnalysisService.analyzeRepository(owner, repo, authorizedClient.getAccessToken().getTokenValue())
                    .map(res -> org.springframework.http.ResponseEntity.ok((Object) res))
                    .onErrorResume(e -> {
                        e.printStackTrace();

                        String message = e.getMessage();
                        if (message == null || message.isEmpty()) {
                            message = e.toString();
                        }

                        // Determine if it is a 404 or 403 response (inaccessible repository)
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
                                    "message", "Le dépôt est introuvable, privé, ou vous n'avez pas les droits pour y accéder."
                                )));
                        }

                        String userFriendlyMessage = "L'analyse a échoué : " + message;
                        if (e instanceof java.util.concurrent.TimeoutException || 
                            e.getCause() instanceof io.netty.handler.timeout.ReadTimeoutException ||
                            message.toLowerCase().contains("timeout")) {
                            userFriendlyMessage = "L'analyse a échoué : Le dépôt est trop volumineux ou GitHub met trop de temps à répondre. Veuillez réessayer.";
                        } else if (message.contains("401") || message.contains("Unauthorized")) {
                            userFriendlyMessage = "L'analyse a échoué : Problème d'authentification avec GitHub.";
                        } else if (message.contains("403") || message.contains("rate limit")) {
                            userFriendlyMessage = "L'analyse a échoué : Limite d'API GitHub atteinte ou accès refusé.";
                        }

                        return Mono.just(org.springframework.http.ResponseEntity
                            .status(org.springframework.http.HttpStatus.valueOf(422))
                            .body((Object) java.util.Map.of(
                                "error", "ANALYSIS_FAILED",
                                "message", userFriendlyMessage
                            )));
                    });
        } catch (Exception e) {
            e.printStackTrace();
            
            boolean isNotFoundOrForbidden = e.getMessage() != null && (e.getMessage().contains("404") || e.getMessage().contains("403"));
            if (isNotFoundOrForbidden) {
                return Mono.just(org.springframework.http.ResponseEntity
                    .status(org.springframework.http.HttpStatus.valueOf(422))
                    .body((Object) java.util.Map.of(
                        "error", "REPO_NOT_FOUND",
                        "message", "Le dépôt est introuvable, privé, ou vous n'avez pas les droits pour y accéder."
                    )));
            }
            
            return Mono.just(org.springframework.http.ResponseEntity
                .status(org.springframework.http.HttpStatus.valueOf(422))
                .body((Object) java.util.Map.of(
                    "error", "ANALYSIS_FAILED",
                    "message", "L'analyse a échoué : " + e.getMessage()
                )));
        }
    }
}