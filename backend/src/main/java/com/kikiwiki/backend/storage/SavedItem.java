package com.kikiwiki.backend.storage;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "saved_items")
public class SavedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavedItemType type;

    @Column(nullable = false)
    private String title;

    private String url;

    private String content;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]", nullable = false)
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는 항목, 값이 있으면 그 시점에 삭제된 항목
    private LocalDateTime deletedAt;

    protected SavedItem() {
    }

    public SavedItem(SavedItemType type, String title, String url, String content, List<String> tags) {
        this.type = type;
        this.title = title;
        this.url = url;
        this.content = content;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(SavedItemType type, String title, String url, String content, List<String> tags) {
        this.type = type;
        this.title = title;
        this.url = url;
        this.content = content;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
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

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
