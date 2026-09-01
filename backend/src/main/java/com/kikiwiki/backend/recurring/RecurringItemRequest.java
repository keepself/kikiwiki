package com.kikiwiki.backend.recurring;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class RecurringItemRequest {

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    @NotNull(message = "금액은 필수입니다.")
    @Positive(message = "금액은 0보다 커야 합니다.")
    private BigDecimal amount;

    @Min(value = 1, message = "결제일은 1~31 사이여야 합니다.")
    @Max(value = 31, message = "결제일은 1~31 사이여야 합니다.")
    private Integer dayOfMonth;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }

    public void setDayOfMonth(Integer dayOfMonth) {
        this.dayOfMonth = dayOfMonth;
    }
}
