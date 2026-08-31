package com.kikiwiki.backend.wishlist;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist_items")
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private BigDecimal price;

    private String imageUrl;

    private String productUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WishlistPriority priority;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는 항목, 값이 있으면 그 시점에 삭제된 항목
    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private boolean purchased = false;

    private LocalDateTime purchasedAt;

    // 구매완료 처리 시 가계부에 자동 등록된 거래의 id (연결 확인/추적용)
    private Long linkedTransactionId;

    protected WishlistItem() {
    }

    public WishlistItem(String name, BigDecimal price, String imageUrl, String productUrl, WishlistPriority priority) {
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.productUrl = productUrl;
        this.priority = priority;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String name, BigDecimal price, String imageUrl, String productUrl, WishlistPriority priority) {
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.productUrl = productUrl;
        this.priority = priority;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public void markPurchased(Long transactionId, BigDecimal finalPrice) {
        this.purchased = true;
        this.purchasedAt = LocalDateTime.now();
        this.linkedTransactionId = transactionId;
        this.price = finalPrice; // 구매 시 입력한 실제 금액으로 갱신 (미리 가격이 없었을 수도 있으므로)
    }

    // 연결된 거래가 삭제됐을 때 - 구매 이전 상태로 되돌림
    public void unmarkPurchased() {
        this.purchased = false;
        this.purchasedAt = null;
        this.linkedTransactionId = null;
    }

    // 연결된 거래의 금액이 수정됐을 때 - 위시리스트 가격도 함께 맞춤
    public void syncPriceFromTransaction(BigDecimal amount) {
        this.price = amount;
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

    public LocalDateTime getDeletedAt() {
        return deletedAt;
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
