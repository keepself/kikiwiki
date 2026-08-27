package com.kikiwiki.backend.category;

import com.kikiwiki.backend.transaction.TransactionType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // GET /api/categories?type=EXPENSE 처럼 type으로 필터링해서 조회
    @GetMapping
    public List<CategoryResponse> getAll(@RequestParam(value = "type", required = false) TransactionType type) {
        List<Category> categories = (type != null)
                ? categoryRepository.findAllByType(type)
                : categoryRepository.findAll();

        return categories.stream()
                .map(CategoryResponse::new)
                .toList();
    }
}