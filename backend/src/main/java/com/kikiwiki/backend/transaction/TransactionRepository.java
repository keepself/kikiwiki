package com.kikiwiki.backend.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository를 상속하면 save(), findAll(), findById() 등이 자동으로 구현됨
// <Transaction, Long> = 다룰 엔티티 타입, 그 엔티티의 id 타입
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
