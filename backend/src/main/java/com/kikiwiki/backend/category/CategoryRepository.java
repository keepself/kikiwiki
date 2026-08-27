package com.kikiwiki.backend.category;

import com.kikiwiki.backend.transaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByType(TransactionType type);
}
