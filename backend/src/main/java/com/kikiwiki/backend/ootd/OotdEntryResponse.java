package com.kikiwiki.backend.ootd;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OotdEntryResponse {

    private Long id;
    private LocalDate entryDate;
    private String imageUrl;
    private String memo;
    private List<String> tags;
    private LocalDateTime createdAt;

    public OotdEntryResponse(OotdEntry entry) {
        this.id = entry.getId();
        this.entryDate = entry.getEntryDate();
        this.imageUrl = "/api/ootd/" + entry.getId() + "/image";
        this.memo = entry.getMemo();
        this.tags = entry.getTags();
        this.createdAt = entry.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getMemo() {
        return memo;
    }

    public List<String> getTags() {
        return tags;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
