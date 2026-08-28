package com.kikiwiki.backend.transaction;

import java.math.BigDecimal;

// 카테고리별 지출 합계 한 줄을 표현
public class CategorySummaryResponse {

    private Long categoryId;
    private String categoryName;
    private BigDecimal totalAmount;

    public CategorySummaryResponse(Long categoryId, String categoryName, BigDecimal totalAmount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalAmount = totalAmount;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
}
