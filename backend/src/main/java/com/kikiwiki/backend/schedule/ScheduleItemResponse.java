package com.kikiwiki.backend.schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ScheduleItemResponse {

    private Long id;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String memo;
    private LocalTime eventTime;
    private Long routineId;
    private LocalDateTime createdAt;

    public ScheduleItemResponse(ScheduleItem item) {
        this.id = item.getId();
        this.title = item.getTitle();
        this.startDate = item.getStartDate();
        this.endDate = item.getEndDate();
        this.memo = item.getMemo();
        this.eventTime = item.getEventTime();
        this.routineId = item.getRoutineId();
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

    public LocalTime getEventTime() {
        return eventTime;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
