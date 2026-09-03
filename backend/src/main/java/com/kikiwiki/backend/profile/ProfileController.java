package com.kikiwiki.backend.profile;

import com.kikiwiki.backend.user.User;
import com.kikiwiki.backend.user.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final BodyWeightLogRepository bodyWeightLogRepository;

    public ProfileController(UserRepository userRepository, BodyWeightLogRepository bodyWeightLogRepository) {
        this.userRepository = userRepository;
        this.bodyWeightLogRepository = bodyWeightLogRepository;
    }

    private User getUser() {
        // 계정이 하나뿐이라 그냥 첫 번째 사용자를 가져옴
        return userRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    @GetMapping
    public ProfileResponse get() {
        return new ProfileResponse(getUser());
    }

    @PutMapping
    public ProfileResponse update(@Valid @RequestBody ProfileRequest request) {
        User user = getUser();
        user.updateHeight(request.getHeightCm());
        userRepository.save(user);
        return new ProfileResponse(user);
    }

    @PutMapping("/photo")
    public ProfileResponse updatePhoto(@Valid @RequestBody ProfileImageRequest request) {
        User user = getUser();
        user.updateProfileImage(request.getDataUrl());
        userRepository.save(user);
        return new ProfileResponse(user);
    }

    @DeleteMapping("/photo")
    public ProfileResponse deletePhoto() {
        User user = getUser();
        user.updateProfileImage(null);
        userRepository.save(user);
        return new ProfileResponse(user);
    }

    @GetMapping("/weight-logs")
    public List<BodyWeightLogResponse> getWeightLogs() {
        return bodyWeightLogRepository.findAllByDeletedAtIsNullOrderByRecordedDateAscCreatedAtAsc()
                .stream()
                .map(BodyWeightLogResponse::new)
                .toList();
    }

    @PostMapping("/weight-logs")
    public ResponseEntity<BodyWeightLogResponse> createWeightLog(@Valid @RequestBody BodyWeightLogRequest request) {
        BodyWeightLog log = new BodyWeightLog(request.getRecordedDate(), request.getWeightKg());
        BodyWeightLog saved = bodyWeightLogRepository.save(log);
        return ResponseEntity.status(HttpStatus.CREATED).body(new BodyWeightLogResponse(saved));
    }

    @DeleteMapping("/weight-logs/{id}")
    public ResponseEntity<Void> deleteWeightLog(@PathVariable("id") Long id) {
        BodyWeightLog log = bodyWeightLogRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "체중 기록을 찾을 수 없습니다: " + id));
        log.softDelete();
        bodyWeightLogRepository.save(log);
        return ResponseEntity.noContent().build();
    }
}
