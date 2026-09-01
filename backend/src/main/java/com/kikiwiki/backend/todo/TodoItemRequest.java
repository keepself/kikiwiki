package com.kikiwiki.backend.todo;

import jakarta.validation.constraints.NotBlank;

public class TodoItemRequest {

    @NotBlank(message = "제목은 필수입니다.")
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
