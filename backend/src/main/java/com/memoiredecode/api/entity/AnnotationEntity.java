package com.memoiredecode.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "annotations", indexes = {
    @Index(name = "idx_repo_full_name", columnList = "repo_full_name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "repo_full_name", nullable = false)
    private String repoFullName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity author;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
