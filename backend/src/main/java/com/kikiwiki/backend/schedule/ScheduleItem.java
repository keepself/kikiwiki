package com.kikiwiki.backend.schedule;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

// 하루짜리 일정은 startDate == endDate. 여행처럼 여러 날 이어지는 일정은 그 기간 전체를 담음
@Entity
@Table(name = "schedule_items")
public class ScheduleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private String memo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는 일정, 값이 있으면 그 시점에 삭제된 일정
    private LocalDateTime deletedAt;

    protected ScheduleItem() {
    }

    public ScheduleItem(String title, LocalDate startDate, LocalDate endDate, String memo) {
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.memo = memo;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String title, LocalDate startDate, LocalDate endDate, String memo) {
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.memo = memo;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getMemo() {
        return memo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
