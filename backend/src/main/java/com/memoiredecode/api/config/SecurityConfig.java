package com.memoiredecode.api.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        org.springframework.security.web.server.authentication.logout.RedirectServerLogoutSuccessHandler logoutSuccessHandler = 
            new org.springframework.security.web.server.authentication.logout.RedirectServerLogoutSuccessHandler();
        logoutSuccessHandler.setLogoutSuccessUrl(java.net.URI.create(allowedOrigins));

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .exceptionHandling(exception -> exception
                // CRUCIAL : Renvoie une erreur 401 au lieu d'une redirection 302 pour que React puisse intercepter l'absence d'auth
                .authenticationEntryPoint(new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/api/auth/status", "/api/auth/logout").permitAll()
                .anyExchange().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                // Redirige vers React (http://localhost:5173) après le succès de l'authentification GitHub
                .authenticationSuccessHandler(new RedirectServerAuthenticationSuccessHandler(allowedOrigins))
            )
            .logout(logout -> logout
                .requiresLogout(org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers(
                    org.springframework.http.HttpMethod.GET, "/api/auth/logout"))
                .logoutSuccessHandler(logoutSuccessHandler)
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}