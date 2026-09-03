package com.kikiwiki.backend.storage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class SavedItemRequest {

    @NotNull(message = "타입은 필수입니다.")
    private SavedItemType type;

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    private String url;
    private String content;
    private List<String> tags;

    public SavedItemRequest() {
    }

    public SavedItemType getType() {
        return type;
    }

    public void setType(SavedItemType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
