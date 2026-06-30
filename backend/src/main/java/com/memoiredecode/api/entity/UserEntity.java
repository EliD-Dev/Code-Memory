package com.memoiredecode.api.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "github_id", unique = true, nullable = false)
    private String githubId;

    @Column(nullable = false)
    private String username;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "preferred_language", nullable = false)
    @Builder.Default
    private String preferredLanguage = "en";

    @Column(name = "encrypted_github_token", length = 500)
    private String encryptedGithubToken;

    @Column(name = "default_os")
    @Builder.Default
    private String defaultOs = "macos_linux";

    @Column(name = "default_package_manager")
    @Builder.Default
    private String defaultPackageManager = "native";

    @Column(name = "default_terminal")
    @Builder.Default
    private String defaultTerminal = "bash";
}
