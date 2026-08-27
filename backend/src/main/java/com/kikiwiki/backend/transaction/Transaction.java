package com.kikiwiki.backend.transaction;

import com.kikiwiki.backend.category.Category;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 금액은 실수(double) 대신 BigDecimal을 씀 - 부동소수점 오차로 돈 계산이 틀어지는 걸 방지
    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    // 문자열 대신 Category 테이블을 참조 (다대일 관계: 여러 거래가 하나의 카테고리를 가리킴)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private String description;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // null이면 살아있는 거래, 값이 있으면 그 시점에 삭제된 거래
    private LocalDateTime deletedAt;

    // JPA는 인자 없는 생성자가 반드시 필요함 (엔티티를 DB에서 읽어올 때 내부적으로 사용)
    protected Transaction() {
    }

    public Transaction(BigDecimal amount, TransactionType type, Category category,
                        String description, LocalDate transactionDate) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.description = description;
        this.transactionDate = transactionDate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 수정 시 사용 - 필드를 하나씩 직접 바꾸지 않고 메서드로 묶어서, 엔티티 스스로 자기 상태를 관리하게 함
    public void update(BigDecimal amount, TransactionType type, Category category,
                        String description, LocalDate transactionDate) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.description = description;
        this.transactionDate = transactionDate;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public Category getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
