package com.kikiwiki.backend.todo;

import java.time.LocalDateTime;

public class TodoItemResponse {

    private Long id;
    private String title;
    private String memo;
    private Long linkedScheduleItemId;
    private TodoStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;

    public TodoItemResponse(TodoItem item) {
        this.id = item.getId();
        this.title = item.getTitle();
        this.memo = item.getMemo();
        this.linkedScheduleItemId = item.getLinkedScheduleItemId();
        this.status = item.getStatus();
        this.createdAt = item.getCreatedAt();
        this.deletedAt = item.getDeletedAt();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMemo() {
        return memo;
    }

    public Long getLinkedScheduleItemId() {
        return linkedScheduleItemId;
    }

    public TodoStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
