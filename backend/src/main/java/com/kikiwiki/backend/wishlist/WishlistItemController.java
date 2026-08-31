package com.kikiwiki.backend.wishlist;

import com.kikiwiki.backend.category.Category;
import com.kikiwiki.backend.category.CategoryRepository;
import com.kikiwiki.backend.transaction.Transaction;
import com.kikiwiki.backend.transaction.TransactionRepository;
import com.kikiwiki.backend.transaction.TransactionType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistItemController {

    private final WishlistItemRepository wishlistItemRepository;
    private final LinkPreviewService linkPreviewService;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public WishlistItemController(
            WishlistItemRepository wishlistItemRepository,
            LinkPreviewService linkPreviewService,
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository
    ) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.linkPreviewService = linkPreviewService;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    // 상품 링크를 붙여넣으면 제목/이미지(가능하면 가격)를 미리 가져와서 폼에 채워줌 (저장은 별도)
    // URL을 쿼리스트링이 아닌 요청 본문으로 받음 - 이미 퍼센트 인코딩된 URL(예: 네이버 스마트스토어)이
    // 쿼리스트링으로 가면 이중 인코딩되어 Spring Security 방화벽이 403으로 차단하는 문제가 있었음
    @PostMapping("/preview")
    public LinkPreviewResponse preview(@RequestBody LinkPreviewRequest request) {
        return linkPreviewService.fetchPreview(request.getUrl());
    }

    @PostMapping
    public ResponseEntity<WishlistItemResponse> create(@RequestBody WishlistItemRequest request) {
        WishlistItem item = new WishlistItem(
                request.getName(),
                request.getPrice(),
                request.getImageUrl(),
                request.getProductUrl(),
                request.getPriority() != null ? request.getPriority() : WishlistPriority.MEDIUM
        );

        WishlistItem saved = wishlistItemRepository.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(new WishlistItemResponse(saved));
    }

    @GetMapping
    public List<WishlistItemResponse> getAll() {
        return wishlistItemRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(WishlistItemResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public WishlistItemResponse update(@PathVariable("id") Long id, @RequestBody WishlistItemRequest request) {
        WishlistItem item = wishlistItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위시리스트 항목을 찾을 수 없습니다: " + id));

        item.update(
                request.getName(),
                request.getPrice(),
                request.getImageUrl(),
                request.getProductUrl(),
                request.getPriority() != null ? request.getPriority() : item.getPriority()
        );

        WishlistItem updated = wishlistItemRepository.save(item);

        return new WishlistItemResponse(updated);
    }

    // 구매완료 처리: 카테고리를 받아서 가계부에 지출 거래를 자동 등록하고, 위시리스트 항목은 구매완료 상태로 표시
    @PostMapping("/{id}/purchase")
    public WishlistItemResponse purchase(@PathVariable("id") Long id, @RequestBody WishlistPurchaseRequest request) {
        WishlistItem item = wishlistItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위시리스트 항목을 찾을 수 없습니다: " + id));

        if (item.isPurchased()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 구매완료 처리된 항목입니다.");
        }

        BigDecimal amount = request.getPrice() != null ? request.getPrice() : item.getPrice();
        if (amount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "가격을 입력해주세요.");
        }
        if (request.getCategoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리입니다: " + request.getCategoryId()));

        Transaction transaction = new Transaction(amount, TransactionType.EXPENSE, category, item.getName(), LocalDate.now());
        Transaction savedTransaction = transactionRepository.save(transaction);

        item.markPurchased(savedTransaction.getId(), amount);
        WishlistItem updated = wishlistItemRepository.save(item);

        return new WishlistItemResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        WishlistItem item = wishlistItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위시리스트 항목을 찾을 수 없습니다: " + id));

        item.softDelete();
        wishlistItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }
}
