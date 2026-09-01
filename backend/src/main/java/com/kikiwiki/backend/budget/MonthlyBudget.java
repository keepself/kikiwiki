package com.kikiwiki.backend.budget;

import jakarta.persistence.*;

import java.math.BigDecimal;

// 절약모드 예산+on/off 여부. 달마다 따로 설정/조회되도록 월(month, "2026-08" 형식)별로 한 행씩 저장
@Entity
@Table(name = "monthly_budgets")
public class MonthlyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String month;

    // 절약모드를 켰지만 아직 예산을 입력하지 않은 상태도 있을 수 있어 null 허용
    private BigDecimal amount;

    @Column(nullable = false)
    private boolean savingsModeEnabled = false;

    protected MonthlyBudget() {
    }

    public MonthlyBudget(String month) {
        this.month = month;
    }

    public void updateAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setSavingsModeEnabled(boolean savingsModeEnabled) {
        this.savingsModeEnabled = savingsModeEnabled;
    }

    public Long getId() {
        return id;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public boolean isSavingsModeEnabled() {
        return savingsModeEnabled;
    }
}
