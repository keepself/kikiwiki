package com.kikiwiki.backend.category;

import com.kikiwiki.backend.transaction.TransactionType;
import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // 이 카테고리가 수입용인지 지출용인지 구분 (TransactionType 재사용)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    protected Category() {
    }

    public Category(String name, TransactionType type) {
        this.name = name;
        this.type = type;
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
