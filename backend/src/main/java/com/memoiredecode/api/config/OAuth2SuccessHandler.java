package com.memoiredecode.api.config;

import com.memoiredecode.api.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
public class OAuth2SuccessHandler implements ServerAuthenticationSuccessHandler {

    private final UserService userService;
    private final RedirectServerAuthenticationSuccessHandler delegate;

    public OAuth2SuccessHandler(UserService userService, @Value("${cors.allowed-origins}") String allowedOrigins) {
        this.userService = userService;
        this.delegate = new RedirectServerAuthenticationSuccessHandler(allowedOrigins);
    }

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            return Mono.fromRunnable(() -> userService.createOrUpdateUser(oauth2User))
                    .subscribeOn(Schedulers.boundedElastic())
                    .then(delegate.onAuthenticationSuccess(webFilterExchange, authentication));
        }
        return delegate.onAuthenticationSuccess(webFilterExchange, authentication);
    }
}
