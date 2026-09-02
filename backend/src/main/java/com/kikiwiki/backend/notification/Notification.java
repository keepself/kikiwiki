package com.kikiwiki.backend.notification;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

// 마감 알림 다이제스트가 이메일 보낼 때 항목별로 하나씩 같이 남겨서, 상단바 종모양 알림함에서도 확인 가능하게 함.
// sourceType+sourceId+sentForDate 조합으로 같은 날 같은 항목이 중복 생성되지 않게 막음
// (다이제스트가 하루에 두 번 실행돼도 - 수동 테스트 등 - 알림함엔 한 번만 남게 됨)
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationSourceType sourceType;

    @Column(nullable = false)
    private Long sourceId;

    @Column(nullable = false)
    private LocalDate sentForDate;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Notification() {
    }

    public Notification(String message, NotificationSourceType sourceType, Long sourceId, LocalDate sentForDate) {
        this.message = message;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.sentForDate = sentForDate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void markRead() {
        this.read = true;
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
