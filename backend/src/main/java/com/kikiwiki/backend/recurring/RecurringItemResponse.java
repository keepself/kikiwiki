package com.kikiwiki.backend.recurring;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RecurringItemResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private boolean appliedThisMonth;

    public RecurringItemResponse(RecurringItem item, boolean appliedThisMonth) {
        this.id = item.getId();
        this.name = item.getName();
        this.amount = item.getAmount();
        this.categoryId = item.getCategory().getId();
        this.categoryName = item.getCategory().getName();
        this.createdAt = item.getCreatedAt();
        this.appliedThisMonth = appliedThisMonth;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isAppliedThisMonth() {
        return appliedThisMonth;
    }
}
