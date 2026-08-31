package com.kikiwiki.backend.transaction;

import com.kikiwiki.backend.category.Category;
import com.kikiwiki.backend.category.CategoryRepository;
import com.kikiwiki.backend.wishlist.WishlistItem;
import com.kikiwiki.backend.wishlist.WishlistItemRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final WishlistItemRepository wishlistItemRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                  CategoryRepository categoryRepository,
                                  WishlistItemRepository wishlistItemRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.wishlistItemRepository = wishlistItemRepository;
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

    // month: 필수 (예: "2026-08"). type, categoryId: 선택 필터. page/size: 페이징 (기본 0페이지, 10개씩)
    @GetMapping
    public TransactionPageResponse getAll(
            @RequestParam("month") String month,
            @RequestParam(value = "type", required = false) TransactionType type,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        YearMonth yearMonth = parseYearMonthOrThrow(month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        Page<Transaction> result = transactionRepository.search(
                start, end, type, categoryId, PageRequest.of(page, size)
        );

        var items = result.getContent().stream().map(TransactionResponse::new).toList();

        return new TransactionPageResponse(items, result.hasNext(), result.getTotalElements());
    }

    private YearMonth parseYearMonthOrThrow(String month) {
        try {
            return YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month 형식이 올바르지 않습니다 (예: 2026-08): " + month);
        }
    }

    // 특정 월의 카테고리별 지출(또는 수입) 합계. 기본값은 지출(EXPENSE)
    @GetMapping("/category-summary")
    public java.util.List<CategorySummaryResponse> getCategorySummary(
            @RequestParam("month") String month,
            @RequestParam(value = "type", defaultValue = "EXPENSE") TransactionType type
    ) {
        YearMonth yearMonth = parseYearMonthOrThrow(month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return transactionRepository.summarizeByCategory(start, end, type);
    }

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

        wishlistItemRepository.findByLinkedTransactionIdAndDeletedAtIsNull(id).ifPresent(item -> {
            item.syncPriceFromTransaction(updated.getAmount());
            wishlistItemRepository.save(item);
        });

        return new TransactionResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        Transaction transaction = transactionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다: " + id));

        transaction.softDelete();
        transactionRepository.save(transaction);

        wishlistItemRepository.findByLinkedTransactionIdAndDeletedAtIsNull(id).ifPresent(item -> {
            item.unmarkPurchased();
            wishlistItemRepository.save(item);
        });

        return ResponseEntity.noContent().build();
    }
}
