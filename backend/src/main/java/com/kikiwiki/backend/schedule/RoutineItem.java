package com.kikiwiki.backend.schedule;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

// 종료일 없이 계속 반복되는 요일 기반 루틴 (예: 금/토/일 헬스장). 실제 캘린더에는 이 루틴에서
// 생성된 ScheduleItem(routineId로 연결)이 각 날짜에 하나씩 채워짐 - ScheduleItemController가
// 월 조회 시점에 필요한 만큼만 생성함 (스케줄러 없음)
@Entity
@Table(name = "routine_items")
public class RoutineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // ISO 요일 값(1=월요일 ~ 7=일요일)을 콤마로 이어붙임. 예: "5,6,7"
    @Column(nullable = false)
    private String daysOfWeek;

    private String memo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는 루틴(계속 새 일정을 만듦), 값이 있으면 해지된 루틴(더 이상 생성 안 함)
    private LocalDateTime deletedAt;

    protected RoutineItem() {
    }

    public RoutineItem(String title, Set<DayOfWeek> daysOfWeek, String memo) {
        this.title = title;
        this.daysOfWeek = daysOfWeek.stream().map(d -> String.valueOf(d.getValue())).collect(Collectors.joining(","));
        this.memo = memo;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String title, Set<DayOfWeek> daysOfWeek, String memo) {
        this.title = title;
        this.daysOfWeek = daysOfWeek.stream().map(d -> String.valueOf(d.getValue())).collect(Collectors.joining(","));
        this.memo = memo;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public Set<DayOfWeek> getDaysOfWeekSet() {
        return java.util.Arrays.stream(daysOfWeek.split(","))
                .map(s -> DayOfWeek.of(Integer.parseInt(s)))
                .collect(Collectors.toSet());
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
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
