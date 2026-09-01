package com.kikiwiki.backend.budget;

import java.math.BigDecimal;

public class BudgetRequest {
    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
