package com.kikiwiki.backend.recurring;

import com.kikiwiki.backend.category.Category;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// 매달 반복되는 고정지출/구독료 템플릿 (실제 거래는 아님 - "이번 달 추가" 시점에 Transaction으로 생성됨)
@Entity
@Table(name = "recurring_items")
public class RecurringItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal amount;

    // 매달 결제되는 날짜(1~31). 지정 안 하면 적용 시점 기준으로 자동 결정됨 (RecurringItemController 참고)
    private Integer dayOfMonth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는(구독 중인) 항목, 값이 있으면 그 시점에 해지된 항목
    private LocalDateTime deletedAt;

    protected RecurringItem() {
    }

    public RecurringItem(String name, BigDecimal amount, Integer dayOfMonth, Category category) {
        this.name = name;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.category = category;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String name, BigDecimal amount, Integer dayOfMonth, Category category) {
        this.name = name;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.category = category;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }

    public Category getCategory() {
        return category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
