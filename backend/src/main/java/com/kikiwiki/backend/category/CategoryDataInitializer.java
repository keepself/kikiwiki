package com.kikiwiki.backend.category;

import com.kikiwiki.backend.transaction.TransactionType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

// 앱이 뜰 때 한 번 실행되어, 카테고리 테이블이 비어있으면 기본값을 채워넣음
@Component
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategoryDataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return; // 이미 데이터가 있으면 아무것도 안 함 (중복 생성 방지)
        }

        List<String> expenseCategories = List.of(
                "식비", "교통", "쇼핑", "문화생활", "주거/통신", "의료", "교육", "경조사", "고정지출", "기타"
        );
        List<String> incomeCategories = List.of(
                "급여", "용돈", "기타수입"
        );

        expenseCategories.forEach(name ->
                categoryRepository.save(new Category(name, TransactionType.EXPENSE)));
        incomeCategories.forEach(name ->
                categoryRepository.save(new Category(name, TransactionType.INCOME)));
    }
}
