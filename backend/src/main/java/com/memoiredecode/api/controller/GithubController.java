package com.memoiredecode.api.controller;

import org.springframework.http.MediaType; // Ajout de cet import
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private final WebClient webClient;

    public GithubController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
    }

    // Ajout de produces = MediaType.APPLICATION_JSON_VALUE
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
                    headers.set("X-GitHub-Api-Version", "2022-11-28"); // Bonne pratique pour l'API GitHub
                })
                .retrieve()
                .bodyToMono(String.class);
    }
}