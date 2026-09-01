package com.kikiwiki.backend.todo;

import jakarta.validation.constraints.NotNull;

public class TodoStatusRequest {

    @NotNull(message = "상태 값이 필요합니다.")
    private TodoStatus status;

    public TodoStatus getStatus() {
        return status;
    }

    public void setStatus(TodoStatus status) {
        this.status = status;
    }
}
