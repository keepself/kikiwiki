package com.kikiwiki.backend.notification;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DigestScheduler {

    private final DigestMailService digestMailService;

    public DigestScheduler(DigestMailService digestMailService) {
        this.digestMailService = digestMailService;
    }

    // 기본값: 매일 아침 8시(KST). app.notification.digest-cron으로 재배포 없이 바꿀 수 있음
    @Scheduled(cron = "${app.notification.digest-cron:0 0 8 * * *}", zone = "Asia/Seoul")
    public void sendDailyDigest() {
        digestMailService.sendDailyDigest();
    }
}
