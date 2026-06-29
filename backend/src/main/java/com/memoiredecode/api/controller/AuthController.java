package com.memoiredecode.api.controller;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/status")
    public Mono<Map<String, Object>> getAuthStatus(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return Mono.just(Map.of("authenticated", false));
        }

        String username = (String) oauth2User.getAttribute("login");
        if (username == null) {
            username = (String) oauth2User.getAttribute("name");
        }

        String avatarUrl = (String) oauth2User.getAttribute("avatar_url");

        return Mono.just(Map.of(
            "authenticated", true,
            "username", username != null ? username : "Utilisateur",
            "avatarUrl", avatarUrl != null ? avatarUrl : ""
        ));
    }
}
