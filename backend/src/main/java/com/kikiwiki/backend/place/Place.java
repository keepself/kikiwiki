package com.kikiwiki.backend.place;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String address;

    private Double lat;

    private Double lng;

    private String category;

    private String placeUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlaceStatus status;

    private Integer rating;

    private String review;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]", nullable = false)
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는 항목, 값이 있으면 그 시점에 삭제된 항목
    private LocalDateTime deletedAt;

    protected Place() {
    }

    public Place(String title, String address, Double lat, Double lng, String category, String placeUrl,
                 PlaceStatus status, Integer rating, String review, List<String> tags) {
        this.title = title;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.category = category;
        this.placeUrl = placeUrl;
        this.status = status;
        this.rating = rating;
        this.review = review;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String title, String address, Double lat, Double lng, String category, String placeUrl,
                        PlaceStatus status, Integer rating, String review, List<String> tags) {
        this.title = title;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.category = category;
        this.placeUrl = placeUrl;
        this.status = status;
        this.rating = rating;
        this.review = review;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
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

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
