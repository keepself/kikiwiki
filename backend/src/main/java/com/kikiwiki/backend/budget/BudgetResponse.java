package com.kikiwiki.backend.budget;

import java.math.BigDecimal;

public class BudgetResponse {
    private BigDecimal amount;
    private boolean savingsModeEnabled;

    public BudgetResponse(BigDecimal amount, boolean savingsModeEnabled) {
        this.amount = amount;
        this.savingsModeEnabled = savingsModeEnabled;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public boolean isSavingsModeEnabled() {
        return savingsModeEnabled;
    }
}
