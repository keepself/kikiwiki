package com.kikiwiki.backend.wishlist;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistItemController {

    private final WishlistItemRepository wishlistItemRepository;
    private final LinkPreviewService linkPreviewService;

    public WishlistItemController(WishlistItemRepository wishlistItemRepository, LinkPreviewService linkPreviewService) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.linkPreviewService = linkPreviewService;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        WishlistItem item = wishlistItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위시리스트 항목을 찾을 수 없습니다: " + id));

        item.softDelete();
        wishlistItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }
}
