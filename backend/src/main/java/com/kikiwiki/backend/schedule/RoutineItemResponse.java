package com.kikiwiki.backend.schedule;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.stream.Collectors;

public class RoutineItemResponse {

    private Long id;
    private String title;
    private Set<Integer> daysOfWeek;
    private String memo;
    private LocalTime eventTime;
    private LocalDateTime createdAt;

    public RoutineItemResponse(RoutineItem item) {
        this.id = item.getId();
        this.title = item.getTitle();
        this.daysOfWeek = item.getDaysOfWeekSet().stream().map(java.time.DayOfWeek::getValue).collect(Collectors.toSet());
        this.memo = item.getMemo();
        this.eventTime = item.getEventTime();
        this.createdAt = item.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Set<Integer> getDaysOfWeek() {
        return daysOfWeek;
    }

    public String getMemo() {
        return memo;
    }

    public LocalTime getEventTime() {
        return eventTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
