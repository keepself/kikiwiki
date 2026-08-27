package com.kikiwiki.backend.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByDeletedAtIsNull();

    Optional<Transaction> findByIdAndDeletedAtIsNull(Long id);

    // 특정 기간(월의 시작일~마지막일) 안에 있는, 삭제되지 않은 거래만 조회
    List<Transaction> findAllByDeletedAtIsNullAndTransactionDateBetween(LocalDate start, LocalDate end);
}
