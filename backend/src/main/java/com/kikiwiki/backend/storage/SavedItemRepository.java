package com.kikiwiki.backend.storage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {

    List<SavedItem> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<SavedItem> findByIdAndDeletedAtIsNull(Long id);
}
