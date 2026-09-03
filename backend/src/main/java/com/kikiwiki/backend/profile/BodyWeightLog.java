package com.kikiwiki.backend.profile;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// 체중 기록 한 건 - 날짜별로 여러 번 남겨서 변화 추이를 봄 (키는 이력 관리 안 하고 현재값만 User에 저장)
@Entity
@Table(name = "body_weight_logs")
public class BodyWeightLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate recordedDate;

    @Column(nullable = false)
    private BigDecimal weightKg;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    protected BodyWeightLog() {
    }

    public BodyWeightLog(LocalDate recordedDate, BigDecimal weightKg) {
        this.recordedDate = recordedDate;
        this.weightKg = weightKg;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getRecordedDate() {
        return recordedDate;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
