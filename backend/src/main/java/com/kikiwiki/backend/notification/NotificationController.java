package com.kikiwiki.backend.notification;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<NotificationResponse> getAll() {
        return notificationRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable("id") Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다: " + id));

        notification.markRead();
        Notification saved = notificationRepository.save(notification);

        return new NotificationResponse(saved);
    }

    @PostMapping("/read-all")
    public List<NotificationResponse> markAllRead() {
        List<Notification> unread = notificationRepository.findAllByReadIsFalse();
        for (Notification notification : unread) {
            notification.markRead();
        }
        notificationRepository.saveAll(unread);

        return notificationRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다: " + id);
        }
        notificationRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
