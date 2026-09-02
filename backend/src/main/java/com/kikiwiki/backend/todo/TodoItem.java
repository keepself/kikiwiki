package com.kikiwiki.backend.todo;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

// 캘린더 일정과는 완전히 별개 - 날짜에 묶이지 않고 진행 상태(칸반)로만 관리되는 할 일
@Entity
@Table(name = "todo_items")
public class TodoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String memo;

    // 마감기한 (선택) - 캘린더 일정과 무관하게 이 할 일 자체의 기한. 카드에 D-day로 표시됨
    private LocalDate dueDate;

    // 캘린더 일정 등록 화면의 "할 일 보드에도 추가" 체크박스로 만들어진 경우, 그 일정의 id.
    // 직접 만든 할 일은 null - 보관과 달리 "삭제"할 땐 이 값을 따라 캘린더 쪽도 같이 지움
    private Long linkedScheduleItemId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TodoStatus status = TodoStatus.TODO;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 활성 항목, 값이 있으면 그 시점에 보관된(archived) 항목 - 실제로 지우진 않고
    // 목록에서만 빠지며, 보관함에서 계속 조회/복원 가능
    private LocalDateTime deletedAt;

    protected TodoItem() {
    }

    public TodoItem(String title, String memo, LocalDate dueDate, Long linkedScheduleItemId) {
        this.title = title;
        this.memo = memo;
        this.dueDate = dueDate;
        this.linkedScheduleItemId = linkedScheduleItemId;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String title, String memo, LocalDate dueDate) {
        this.title = title;
        this.memo = memo;
        this.dueDate = dueDate;
    }

    public void updateStatus(TodoStatus status) {
        this.status = status;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    // 보관함에서 복원 - 다시 활성 상태(진행 중)로 되돌림
    public void restore() {
        this.deletedAt = null;
        this.status = TodoStatus.IN_PROGRESS;
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

    public LocalDate getDueDate() {
        return dueDate;
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
