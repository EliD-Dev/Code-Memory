package com.memoiredecode.api.service;

import com.memoiredecode.api.entity.UserEntity;
import com.memoiredecode.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserEntity createOrUpdateUser(OAuth2User oauth2User) {
        Object idAttr = oauth2User.getAttribute("id");
        if (idAttr == null) {
            return null;
        }
        String githubId = String.valueOf(idAttr);

        String username = (String) oauth2User.getAttribute("login");
        if (username == null) {
            username = (String) oauth2User.getAttribute("name");
        }
        if (username == null) {
            username = "Utilisateur";
        }

        String avatarUrl = (String) oauth2User.getAttribute("avatar_url");

        Optional<UserEntity> userOpt = userRepository.findByGithubId(githubId);
        UserEntity user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            user.setUsername(username);
            user.setAvatarUrl(avatarUrl);
        } else {
            user = UserEntity.builder()
                    .githubId(githubId)
                    .username(username)
                    .avatarUrl(avatarUrl)
                    .preferredLanguage("en")
                    .build();
        }
        return userRepository.save(user);
    }
}
