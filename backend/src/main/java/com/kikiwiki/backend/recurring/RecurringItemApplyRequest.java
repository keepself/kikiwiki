package com.kikiwiki.backend.recurring;

import java.math.BigDecimal;

// "이번 달 추가" 시 화면에서 보고 있는 달을 알려주고(month), 금액을 다르게 쓰고 싶으면 덮어쓰기(amount, 선택)
public class RecurringItemApplyRequest {

    private String month;
    private BigDecimal amount;

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
