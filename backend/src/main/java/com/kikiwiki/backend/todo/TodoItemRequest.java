package com.kikiwiki.backend.todo;

public class TodoItemRequest {

    private String title;
    private String memo;
    private Long linkedScheduleItemId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    public Long getLinkedScheduleItemId() {
        return linkedScheduleItemId;
    }

    public void setLinkedScheduleItemId(Long linkedScheduleItemId) {
        this.linkedScheduleItemId = linkedScheduleItemId;
    }
}
