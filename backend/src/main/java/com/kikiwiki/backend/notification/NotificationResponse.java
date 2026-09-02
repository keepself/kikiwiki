package com.kikiwiki.backend.notification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.message = notification.getMessage();
        this.read = notification.isRead();
        this.createdAt = notification.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
