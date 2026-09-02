package com.kikiwiki.backend.todo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {

    List<TodoItem> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<TodoItem> findByIdAndDeletedAtIsNull(Long id);

    // 보관함 조회 - 최근 보관된 것부터
    List<TodoItem> findAllByDeletedAtIsNotNullOrderByDeletedAtDesc();

    // 마감 알림 다이제스트용 - 완료되지 않은, 마감일이 특정 날짜인 항목
    List<TodoItem> findAllByDueDateAndDeletedAtIsNullAndStatusNot(LocalDate dueDate, TodoStatus status);
}
