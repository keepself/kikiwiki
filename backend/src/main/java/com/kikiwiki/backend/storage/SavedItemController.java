package com.kikiwiki.backend.storage;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/saved-items")
public class SavedItemController {

    private final SavedItemRepository savedItemRepository;

    public SavedItemController(SavedItemRepository savedItemRepository) {
        this.savedItemRepository = savedItemRepository;
    }

    @PostMapping
    public ResponseEntity<SavedItemResponse> create(@Valid @RequestBody SavedItemRequest request) {
        SavedItem item = new SavedItem(
                request.getType(),
                request.getTitle(),
                request.getUrl(),
                request.getContent(),
                request.getTags()
        );

        SavedItem saved = savedItemRepository.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(new SavedItemResponse(saved));
    }

    @GetMapping
    public List<SavedItemResponse> getAll() {
        return savedItemRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(SavedItemResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public SavedItemResponse update(@PathVariable("id") Long id, @Valid @RequestBody SavedItemRequest request) {
        SavedItem item = savedItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "저장 항목을 찾을 수 없습니다: " + id));

        item.update(
                request.getType(),
                request.getTitle(),
                request.getUrl(),
                request.getContent(),
                request.getTags()
        );

        SavedItem updated = savedItemRepository.save(item);

        return new SavedItemResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        SavedItem item = savedItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "저장 항목을 찾을 수 없습니다: " + id));

        item.softDelete();
        savedItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }
}
