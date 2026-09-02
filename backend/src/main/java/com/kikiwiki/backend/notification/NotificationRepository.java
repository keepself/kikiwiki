package com.kikiwiki.backend.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 최근 것 위주로만 (무한정 쌓이지 않게)
    List<Notification> findTop50ByOrderByCreatedAtDesc();

    // 같은 항목에 대해 오늘 이미 알림을 만들었는지 확인 (다이제스트 중복 실행 대비)
    boolean existsBySourceTypeAndSourceIdAndSentForDate(
            NotificationSourceType sourceType, Long sourceId, LocalDate sentForDate
    );

    List<Notification> findAllByReadIsFalse();
}
