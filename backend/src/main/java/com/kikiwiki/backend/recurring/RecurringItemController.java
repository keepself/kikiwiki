package com.kikiwiki.backend.recurring;

import com.kikiwiki.backend.category.Category;
import com.kikiwiki.backend.category.CategoryRepository;
import com.kikiwiki.backend.transaction.Transaction;
import com.kikiwiki.backend.transaction.TransactionRepository;
import com.kikiwiki.backend.transaction.TransactionResponse;
import com.kikiwiki.backend.transaction.TransactionType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/recurring-items")
public class RecurringItemController {

    private final RecurringItemRepository recurringItemRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public RecurringItemController(
            RecurringItemRepository recurringItemRepository,
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository
    ) {
        this.recurringItemRepository = recurringItemRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    private Category getCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리입니다: " + categoryId));
    }

    @PostMapping
    public ResponseEntity<RecurringItemResponse> create(@RequestBody RecurringItemRequest request) {
        Category category = getCategoryOrThrow(request.getCategoryId());

        RecurringItem item = new RecurringItem(request.getName(), request.getAmount(), category);
        RecurringItem saved = recurringItemRepository.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(new RecurringItemResponse(saved, false));
    }

    // month(예: "2026-09")를 주면 그 달에 이미 추가됐는지(appliedThisMonth)까지 함께 내려줌. 생략하면 이번 달 기준.
    @GetMapping
    public List<RecurringItemResponse> getAll(@RequestParam(value = "month", required = false) String month) {
        YearMonth yearMonth = month != null ? parseYearMonthOrThrow(month) : YearMonth.now();
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return recurringItemRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(item -> {
                    boolean applied = transactionRepository
                            .existsByRecurringItemIdAndTransactionDateBetweenAndDeletedAtIsNull(item.getId(), start, end);
                    return new RecurringItemResponse(item, applied);
                })
                .toList();
    }

    private YearMonth parseYearMonthOrThrow(String month) {
        try {
            return YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month 형식이 올바르지 않습니다 (예: 2026-08): " + month);
        }
    }

    @PutMapping("/{id}")
    public RecurringItemResponse update(@PathVariable("id") Long id, @RequestBody RecurringItemRequest request) {
        RecurringItem item = recurringItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "고정지출 항목을 찾을 수 없습니다: " + id));

        Category category = getCategoryOrThrow(request.getCategoryId());
        item.update(request.getName(), request.getAmount(), category);

        RecurringItem updated = recurringItemRepository.save(item);
        return new RecurringItemResponse(updated, false);
    }

    // "이번 달 추가": 이 템플릿으로 실제 거래를 하나 생성. 금액/날짜는 필요하면 덮어쓰기 가능.
    @PostMapping("/{id}/apply")
    public TransactionResponse apply(@PathVariable("id") Long id, @RequestBody(required = false) RecurringItemApplyRequest request) {
        RecurringItem item = recurringItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "고정지출 항목을 찾을 수 없습니다: " + id));

        BigDecimal amount = (request != null && request.getAmount() != null) ? request.getAmount() : item.getAmount();
        LocalDate transactionDate = (request != null && request.getTransactionDate() != null)
                ? request.getTransactionDate() : LocalDate.now();

        YearMonth targetMonth = YearMonth.from(transactionDate);
        boolean alreadyApplied = transactionRepository.existsByRecurringItemIdAndTransactionDateBetweenAndDeletedAtIsNull(
                item.getId(), targetMonth.atDay(1), targetMonth.atEndOfMonth()
        );
        if (alreadyApplied) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 이번 달에 추가된 항목입니다.");
        }

        Transaction transaction = new Transaction(amount, TransactionType.EXPENSE, item.getCategory(), item.getName(), transactionDate);
        transaction.linkRecurringItem(item.getId());
        Transaction saved = transactionRepository.save(transaction);

        return new TransactionResponse(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        RecurringItem item = recurringItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "고정지출 항목을 찾을 수 없습니다: " + id));

        item.softDelete();
        recurringItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }
}
