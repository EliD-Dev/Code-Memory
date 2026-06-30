package com.memoiredecode.api.controller;

import com.memoiredecode.api.entity.UserEntity;
import com.memoiredecode.api.repository.UserRepository;
import com.memoiredecode.api.service.EncryptionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class ProfileController {

    private final UserRepository userRepository;
    private final EncryptionService encryptionService;

    public ProfileController(UserRepository userRepository, EncryptionService encryptionService) {
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
    }

    @PatchMapping("/profile")
    public Mono<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody Map<String, String> body) {
        
        if (oauth2User == null) {
            return Mono.error(new org.springframework.security.authentication.BadCredentialsException("User not authenticated"));
        }

        String preferredLanguage = body.get("preferredLanguage");
        String personalToken = body.get("personalToken");
        String defaultOs = body.get("defaultOs");
        String defaultPackageManager = body.get("defaultPackageManager");
        String defaultTerminal = body.get("defaultTerminal");

        Object idAttr = oauth2User.getAttribute("id");
        if (idAttr == null) {
            return Mono.error(new RuntimeException("GitHub ID not found in principal"));
        }
        String githubId = String.valueOf(idAttr);

        return Mono.fromCallable(() -> {
            UserEntity user = userRepository.findByGithubId(githubId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (preferredLanguage != null && !preferredLanguage.trim().isEmpty()) {
                user.setPreferredLanguage(preferredLanguage);
            }

            if (personalToken != null) {
                if (personalToken.trim().isEmpty()) {
                    user.setEncryptedGithubToken(null);
                } else {
                    user.setEncryptedGithubToken(encryptionService.encrypt(personalToken.trim()));
                }
            }

            if (defaultOs != null && !defaultOs.trim().isEmpty()) {
                user.setDefaultOs(defaultOs);
            }
            if (defaultPackageManager != null && !defaultPackageManager.trim().isEmpty()) {
                user.setDefaultPackageManager(defaultPackageManager);
            }
            if (defaultTerminal != null && !defaultTerminal.trim().isEmpty()) {
                user.setDefaultTerminal(defaultTerminal);
            }

            userRepository.save(user);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("preferredLanguage", user.getPreferredLanguage());
            return response;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
