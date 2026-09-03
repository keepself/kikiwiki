package com.kikiwiki.backend.storage;

import java.time.LocalDateTime;
import java.util.List;

public class SavedItemResponse {

    private Long id;
    private SavedItemType type;
    private String title;
    private String url;
    private String content;
    private List<String> tags;
    private LocalDateTime createdAt;

    public SavedItemResponse(SavedItem item) {
        this.id = item.getId();
        this.type = item.getType();
        this.title = item.getTitle();
        this.url = item.getUrl();
        this.content = item.getContent();
        this.tags = item.getTags();
        this.createdAt = item.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public SavedItemType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getUrl() {
        return url;
    }

    public String getContent() {
        return content;
    }

    public List<String> getTags() {
        return tags;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
