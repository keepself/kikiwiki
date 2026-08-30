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

    public WishlistItemController(WishlistItemRepository wishlistItemRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
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
