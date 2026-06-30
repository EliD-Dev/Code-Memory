package com.memoiredecode.api.controller;

import com.memoiredecode.api.entity.AnnotationEntity;
import com.memoiredecode.api.entity.UserEntity;
import com.memoiredecode.api.repository.AnnotationRepository;
import com.memoiredecode.api.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/annotations")
public class AnnotationController {

    private final AnnotationRepository annotationRepository;
    private final UserRepository userRepository;

    public AnnotationController(AnnotationRepository annotationRepository, UserRepository userRepository) {
        this.annotationRepository = annotationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Mono<List<Map<String, Object>>> getAnnotations(@RequestParam String repo) {
        return Mono.fromCallable(() -> {
            List<AnnotationEntity> list = annotationRepository.findByRepoFullName(repo);
            return list.stream().map(a -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", a.getId().toString());
                map.put("repoFullName", a.getRepoFullName());
                map.put("filePath", a.getFilePath());
                map.put("content", a.getContent());
                map.put("createdAt", a.getCreatedAt().toString());
                
                Map<String, Object> authorMap = new HashMap<>();
                authorMap.put("username", a.getAuthor().getUsername());
                authorMap.put("avatarUrl", a.getAuthor().getAvatarUrl());
                map.put("author", authorMap);
                
                return map;
            }).collect(Collectors.toList());
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping
    public Mono<Map<String, Object>> addAnnotation(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody Map<String, String> body) {
        
        if (oauth2User == null) {
            return Mono.error(new org.springframework.security.authentication.BadCredentialsException("User not authenticated"));
        }

        String repo = body.get("repoFullName");
        String filePath = body.get("filePath");
        String content = body.get("content");

        if (repo == null || filePath == null || content == null || content.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Missing required fields"));
        }

        Object idAttr = oauth2User.getAttribute("id");
        if (idAttr == null) {
            return Mono.error(new RuntimeException("GitHub ID not found in principal"));
        }
        String githubId = String.valueOf(idAttr);

        return Mono.fromCallable(() -> {
            UserEntity user = userRepository.findByGithubId(githubId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AnnotationEntity annotation = AnnotationEntity.builder()
                    .repoFullName(repo)
                    .filePath(filePath)
                    .content(content.trim())
                    .author(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            annotationRepository.save(annotation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", annotation.getId().toString());
            return response;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @DeleteMapping("/{id}")
    public Mono<Map<String, Object>> deleteAnnotation(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @PathVariable String id) {
        
        if (oauth2User == null) {
            return Mono.error(new org.springframework.security.authentication.BadCredentialsException("User not authenticated"));
        }

        Object idAttr = oauth2User.getAttribute("id");
        if (idAttr == null) {
            return Mono.error(new RuntimeException("GitHub ID not found in principal"));
        }
        String githubId = String.valueOf(idAttr);

        return Mono.fromCallable(() -> {
            UserEntity user = userRepository.findByGithubId(githubId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UUID uuid = UUID.fromString(id);
            AnnotationEntity annotation = annotationRepository.findById(uuid)
                    .orElseThrow(() -> new RuntimeException("Annotation not found"));

            if (!annotation.getAuthor().getId().equals(user.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Not the author of this annotation");
            }

            annotationRepository.delete(annotation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return response;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
