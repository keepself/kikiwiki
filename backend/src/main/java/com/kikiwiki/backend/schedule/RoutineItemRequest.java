package com.kikiwiki.backend.schedule;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public class RoutineItemRequest {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotEmpty(message = "반복할 요일을 하나 이상 선택해주세요.")
    private Set<@Min(value = 1, message = "요일 값은 1~7 사이여야 합니다.") @Max(value = 7, message = "요일 값은 1~7 사이여야 합니다.") Integer> daysOfWeek;

    private String memo;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Set<Integer> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(Set<Integer> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }
}
