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
}
