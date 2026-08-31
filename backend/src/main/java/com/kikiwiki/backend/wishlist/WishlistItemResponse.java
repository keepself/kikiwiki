package com.kikiwiki.backend.wishlist;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishlistItemResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private String imageUrl;
    private String productUrl;
    private WishlistPriority priority;
    private LocalDateTime createdAt;
    private boolean purchased;
    private LocalDateTime purchasedAt;
    private Long linkedTransactionId;

    public WishlistItemResponse(WishlistItem item) {
        this.id = item.getId();
        this.name = item.getName();
        this.price = item.getPrice();
        this.imageUrl = item.getImageUrl();
        this.productUrl = item.getProductUrl();
        this.priority = item.getPriority();
        this.createdAt = item.getCreatedAt();
        this.purchased = item.isPurchased();
        this.purchasedAt = item.getPurchasedAt();
        this.linkedTransactionId = item.getLinkedTransactionId();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public WishlistPriority getPriority() {
        return priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isPurchased() {
        return purchased;
    }

    public LocalDateTime getPurchasedAt() {
        return purchasedAt;
    }

    public Long getLinkedTransactionId() {
        return linkedTransactionId;
    }
}
