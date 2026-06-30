package com.memoiredecode.api.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.memoiredecode.api.entity.UserEntity;
import com.memoiredecode.api.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final com.memoiredecode.api.repository.SearchHistoryRepository searchHistoryRepository;

    public AuthController(UserRepository userRepository, 
                          com.memoiredecode.api.repository.SearchHistoryRepository searchHistoryRepository) {
        this.userRepository = userRepository;
        this.searchHistoryRepository = searchHistoryRepository;
    }

    @GetMapping("/status")
    public Mono<Map<String, Object>> getAuthStatus(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return Mono.just(Map.of("authenticated", false));
        }

        String username = (String) oauth2User.getAttribute("login");
        if (username == null) {
            username = (String) oauth2User.getAttribute("name");
        }
        final String finalUsername = username != null ? username : "Utilisateur";

        String avatarUrl = (String) oauth2User.getAttribute("avatar_url");
        final String finalAvatarUrl = avatarUrl != null ? avatarUrl : "";

        Object idAttr = oauth2User.getAttribute("id");
        if (idAttr == null) {
            Map<String, Object> fallbackRes = new java.util.HashMap<>();
            fallbackRes.put("authenticated", true);
            fallbackRes.put("username", finalUsername);
            fallbackRes.put("avatarUrl", finalAvatarUrl);
            fallbackRes.put("preferredLanguage", "en");
            fallbackRes.put("hasPersonalToken", false);
            fallbackRes.put("defaultOs", "macos_linux");
            fallbackRes.put("defaultPackageManager", "native");
            fallbackRes.put("defaultTerminal", "bash");
            fallbackRes.put("searchHistory", java.util.Collections.emptyList());
            return Mono.just(fallbackRes);
        }
        String githubId = String.valueOf(idAttr);

        return Mono.fromCallable(() -> {
            Optional<UserEntity> userOpt = userRepository.findByGithubId(githubId);
            String lang = "en";
            boolean hasToken = false;
            if (userOpt.isPresent()) {
                lang = userOpt.get().getPreferredLanguage();
                hasToken = userOpt.get().getEncryptedGithubToken() != null;
            }
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("authenticated", true);
            response.put("username", finalUsername);
            response.put("avatarUrl", finalAvatarUrl);
            response.put("preferredLanguage", lang);
            response.put("hasPersonalToken", hasToken);

            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                response.put("defaultOs", user.getDefaultOs() != null ? user.getDefaultOs() : "macos_linux");
                response.put("defaultPackageManager", user.getDefaultPackageManager() != null ? user.getDefaultPackageManager() : "native");
                response.put("defaultTerminal", user.getDefaultTerminal() != null ? user.getDefaultTerminal() : "bash");

                List<com.memoiredecode.api.entity.SearchHistoryEntity> historyList = 
                    searchHistoryRepository.findByUserOrderBySearchDateDesc(user);
                List<String> repos = historyList.stream()
                    .map(com.memoiredecode.api.entity.SearchHistoryEntity::getRepoFullName)
                    .collect(java.util.stream.Collectors.toList());
                response.put("searchHistory", repos);
            } else {
                response.put("defaultOs", "macos_linux");
                response.put("defaultPackageManager", "native");
                response.put("defaultTerminal", "bash");
                response.put("searchHistory", java.util.Collections.emptyList());
            }
            return response;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
