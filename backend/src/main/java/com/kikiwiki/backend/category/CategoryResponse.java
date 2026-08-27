package com.kikiwiki.backend.category;

import com.kikiwiki.backend.transaction.TransactionType;

public class CategoryResponse {

    private Long id;
    private String name;
    private TransactionType type;

    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.type = category.getType();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public TransactionType getType() {
        return type;
    }
}
