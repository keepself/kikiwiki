package com.kikiwiki.backend.recurring;

import java.math.BigDecimal;
import java.time.LocalDate;

// "이번 달 추가" 시 금액/날짜를 템플릿과 다르게 쓰고 싶을 때 덮어쓰기용 (둘 다 선택사항)
public class RecurringItemApplyRequest {

    private BigDecimal amount;
    private LocalDate transactionDate;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }
}
