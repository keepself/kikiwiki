package com.kikiwiki.backend.place;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PlaceRequest {

    @NotBlank(message = "이름은 필수입니다.")
    private String title;

    private String address;
    private Double lat;
    private Double lng;
    private String category;
    private String placeUrl;

    @NotNull(message = "상태는 필수입니다.")
    private PlaceStatus status;

    @Min(value = 1, message = "별점은 1~5 사이여야 합니다.")
    @Max(value = 5, message = "별점은 1~5 사이여야 합니다.")
    private Integer rating;

    private String review;
    private List<String> tags;

    public PlaceRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPlaceUrl() {
        return placeUrl;
    }

    public void setPlaceUrl(String placeUrl) {
        this.placeUrl = placeUrl;
    }

    public PlaceStatus getStatus() {
        return status;
    }

    public void setStatus(PlaceStatus status) {
        this.status = status;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
