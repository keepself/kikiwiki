package com.kikiwiki.backend.wishlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class WishlistItemRequest {

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    @Positive(message = "가격은 0보다 커야 합니다.")
    private BigDecimal price;
    private String imageUrl;
    private String productUrl;
    private WishlistPriority priority;

    public WishlistItemRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public void setProductUrl(String productUrl) {
        this.productUrl = productUrl;
    }

    public WishlistPriority getPriority() {
        return priority;
    }

    public void setPriority(WishlistPriority priority) {
        this.priority = priority;
    }
}
