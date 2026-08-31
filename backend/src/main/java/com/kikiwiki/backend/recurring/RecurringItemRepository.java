package com.kikiwiki.backend.recurring;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecurringItemRepository extends JpaRepository<RecurringItem, Long> {

    List<RecurringItem> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<RecurringItem> findByIdAndDeletedAtIsNull(Long id);
}
