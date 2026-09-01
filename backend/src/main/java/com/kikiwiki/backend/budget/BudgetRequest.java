package com.kikiwiki.backend.budget;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class BudgetRequest {

    @NotNull(message = "예산 금액이 필요합니다.")
    @Positive(message = "예산 금액은 0보다 커야 합니다.")
    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
