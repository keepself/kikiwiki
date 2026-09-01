package com.kikiwiki.backend.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoutineItemRepository extends JpaRepository<RoutineItem, Long> {

    List<RoutineItem> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<RoutineItem> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByTitleAndDeletedAtIsNull(String title);

    boolean existsByTitleAndDeletedAtIsNullAndIdNot(String title, Long id);
}
