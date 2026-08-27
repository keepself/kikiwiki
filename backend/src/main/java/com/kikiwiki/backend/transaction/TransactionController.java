package com.kikiwiki.backend.transaction;

import com.kikiwiki.backend.category.Category;
import com.kikiwiki.backend.category.CategoryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                  CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    private Category getCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리입니다: " + categoryId));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@RequestBody TransactionRequest request) {
        Category category = getCategoryOrThrow(request.getCategoryId());

        Transaction transaction = new Transaction(
                request.getAmount(),
                request.getType(),
                category,
                request.getDescription(),
                request.getTransactionDate()
        );

        Transaction saved = transactionRepository.save(transaction);

        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionResponse(saved));
    }

    // month가 없으면 전체 조회, 있으면 (예: "2026-08") 해당 월만 조회
    @GetMapping
    public List<TransactionResponse> getAll(@RequestParam(value = "month", required = false) String month) {
        List<Transaction> transactions;

        if (month == null || month.isBlank()) {
            transactions = transactionRepository.findAllByDeletedAtIsNull();
        } else {
            YearMonth yearMonth = parseYearMonthOrThrow(month);
            LocalDate start = yearMonth.atDay(1);
            LocalDate end = yearMonth.atEndOfMonth();
            transactions = transactionRepository.findAllByDeletedAtIsNullAndTransactionDateBetween(start, end);
        }

        return transactions.stream()
                .map(TransactionResponse::new)
                .toList();
    }

    private YearMonth parseYearMonthOrThrow(String month) {
        try {
            return YearMonth.parse(month); // "yyyy-MM" 형식 기대
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month 형식이 올바르지 않습니다 (예: 2026-08): " + month);
        }
    }

    // 특정 연도에 거래가 존재하는 월들을 반환 (예: ["2026-01", "2026-03", "2026-08"])
    // 프론트의 월 선택 그리드에서 데이터가 있는 달을 강조 표시하는 데 사용
    @GetMapping("/active-months")
    public Set<String> getActiveMonths(@RequestParam("year") int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        return transactionRepository.findAllByDeletedAtIsNullAndTransactionDateBetween(start, end)
                .stream()
                .map(t -> YearMonth.from(t.getTransactionDate()).toString())
                .collect(Collectors.toSet());
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable("id") Long id, @RequestBody TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다: " + id));

        Category category = getCategoryOrThrow(request.getCategoryId());

        transaction.update(
                request.getAmount(),
                request.getType(),
                category,
                request.getDescription(),
                request.getTransactionDate()
        );

        Transaction updated = transactionRepository.save(transaction);

        return new TransactionResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        Transaction transaction = transactionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다: " + id));

        transaction.softDelete();
        transactionRepository.save(transaction);

        return ResponseEntity.noContent().build();
    }
}
