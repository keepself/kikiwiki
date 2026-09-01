package com.kikiwiki.backend.schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ScheduleItemResponse {

    private Long id;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String memo;
    private LocalDateTime createdAt;

    public ScheduleItemResponse(ScheduleItem item) {
        this.id = item.getId();
        this.title = item.getTitle();
        this.startDate = item.getStartDate();
        this.endDate = item.getEndDate();
        this.memo = item.getMemo();
        this.createdAt = item.getCreatedAt();
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
}
