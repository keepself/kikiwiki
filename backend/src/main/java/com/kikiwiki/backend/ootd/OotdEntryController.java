package com.kikiwiki.backend.ootd;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/ootd")
public class OotdEntryController {

    private final OotdEntryRepository ootdEntryRepository;
    private final OotdImageStorageService ootdImageStorageService;

    public OotdEntryController(OotdEntryRepository ootdEntryRepository, OotdImageStorageService ootdImageStorageService) {
        this.ootdEntryRepository = ootdEntryRepository;
        this.ootdImageStorageService = ootdImageStorageService;
    }

    @PostMapping
    public ResponseEntity<OotdEntryResponse> create(@Valid @RequestBody OotdEntryRequest request) {
        String filename = ootdImageStorageService.save(request.getImageDataUrl(), request.getEntryDate());
        OotdEntry entry = new OotdEntry(request.getEntryDate(), filename, request.getMemo(), request.getTags());

        OotdEntry saved = ootdEntryRepository.save(entry);

        return ResponseEntity.status(HttpStatus.CREATED).body(new OotdEntryResponse(saved));
    }

    @GetMapping
    public List<OotdEntryResponse> getAll() {
        return ootdEntryRepository.findAllByDeletedAtIsNullOrderByEntryDateDescCreatedAtDesc()
                .stream()
                .map(OotdEntryResponse::new)
                .toList();
    }

    // 이미지 자체는 <img src>로 바로 불러와야 해서(요청 헤더에 인증 토큰을 못 실음) 이 엔드포인트만
    // SecurityConfig에서 인증 없이 열어둠 - id를 알아야 접근 가능한 정도의 보호만 있음
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable("id") Long id) {
        OotdEntry entry = ootdEntryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사진을 찾을 수 없습니다: " + id));

        byte[] bytes = ootdImageStorageService.read(entry.getImageFilename());

        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        OotdEntry entry = ootdEntryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사진을 찾을 수 없습니다: " + id));

        entry.softDelete();
        ootdEntryRepository.save(entry);

        return ResponseEntity.noContent().build();
    }
}
