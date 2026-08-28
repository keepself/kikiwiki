package com.kikiwiki.backend.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByDeletedAtIsNull();

    Optional<Transaction> findByIdAndDeletedAtIsNull(Long id);

    List<Transaction> findAllByDeletedAtIsNullAndTransactionDateBetween(LocalDate start, LocalDate end);

    // type, categoryId는 null이면 조건 무시 (전체 포함). 최신 날짜 순으로 정렬.
    @Query("""
            SELECT t FROM Transaction t
            WHERE t.deletedAt IS NULL
            AND t.transactionDate BETWEEN :start AND :end
            AND (:type IS NULL OR t.type = :type)
            AND (:categoryId IS NULL OR t.category.id = :categoryId)
            ORDER BY t.transactionDate DESC, t.id DESC
            """)
    Page<Transaction> search(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );

    // 특정 기간, 특정 구분(수입/지출)의 거래를 카테고리별로 묶어 합계를 계산. 금액이 큰 순으로 정렬.
    @Query("""
            SELECT new com.kikiwiki.backend.transaction.CategorySummaryResponse(
                t.category.id, t.category.name, SUM(t.amount)
            )
            FROM Transaction t
            WHERE t.deletedAt IS NULL
            AND t.transactionDate BETWEEN :start AND :end
            AND t.type = :type
            GROUP BY t.category.id, t.category.name
            ORDER BY SUM(t.amount) DESC
            """)
    List<CategorySummaryResponse> summarizeByCategory(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") TransactionType type
    );
}
