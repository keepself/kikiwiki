package com.kikiwiki.backend.wishlist;

public class LinkPreviewResponse {

    private final String title;
    private final String imageUrl;
    private final String price;

    public LinkPreviewResponse(String title, String imageUrl, String price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
    }

    public String getTitle() {
        return title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getPrice() {
        return price;
    }
}
