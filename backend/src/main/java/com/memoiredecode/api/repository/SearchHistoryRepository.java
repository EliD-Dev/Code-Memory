package com.memoiredecode.api.repository;

import com.memoiredecode.api.entity.SearchHistoryEntity;
import com.memoiredecode.api.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistoryEntity, UUID> {
    List<SearchHistoryEntity> findByUserOrderBySearchDateDesc(UserEntity user);
    List<SearchHistoryEntity> findByUser(UserEntity user);
    void deleteByUser(UserEntity user);
}
