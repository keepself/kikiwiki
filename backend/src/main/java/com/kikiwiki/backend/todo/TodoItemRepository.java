package com.kikiwiki.backend.todo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {

    List<TodoItem> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<TodoItem> findByIdAndDeletedAtIsNull(Long id);

    // 보관함 조회 - 최근 보관된 것부터
    List<TodoItem> findAllByDeletedAtIsNotNullOrderByDeletedAtDesc();
}
