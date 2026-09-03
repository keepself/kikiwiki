package com.kikiwiki.backend.place;

import java.time.LocalDateTime;
import java.util.List;

public class PlaceResponse {

    private Long id;
    private String title;
    private String address;
    private Double lat;
    private Double lng;
    private String category;
    private String placeUrl;
    private PlaceStatus status;
    private Integer rating;
    private String review;
    private List<String> tags;
    private LocalDateTime createdAt;

    public PlaceResponse(Place place) {
        this.id = place.getId();
        this.title = place.getTitle();
        this.address = place.getAddress();
        this.lat = place.getLat();
        this.lng = place.getLng();
        this.category = place.getCategory();
        this.placeUrl = place.getPlaceUrl();
        this.status = place.getStatus();
        this.rating = place.getRating();
        this.review = place.getReview();
        this.tags = place.getTags();
        this.createdAt = place.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAddress() {
        return address;
    }

    public Double getLat() {
        return lat;
    }

    public Double getLng() {
        return lng;
    }

    public String getCategory() {
        return category;
    }

    public String getPlaceUrl() {
        return placeUrl;
    }

    public PlaceStatus getStatus() {
        return status;
    }

    public Integer getRating() {
        return rating;
    }

    public String getReview() {
        return review;
    }

    public List<String> getTags() {
        return tags;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
