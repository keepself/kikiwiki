package com.kikiwiki.backend.wishlist;

import java.math.BigDecimal;

public class WishlistPurchaseRequest {

    private Long categoryId;
    // 위시리스트에 가격이 없었거나, 실제 구매 금액이 다를 때 여기 값을 우선 사용함
    private BigDecimal price;

    public WishlistPurchaseRequest() {
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
