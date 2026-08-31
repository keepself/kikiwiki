package com.kikiwiki.backend.user;

import java.math.BigDecimal;

public class BudgetResponse {
    private BigDecimal amount;

    public BudgetResponse(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}
