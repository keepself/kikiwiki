package com.kikiwiki.backend.notification;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/digest")
public class DigestController {

    private final DigestMailService digestMailService;

    public DigestController(DigestMailService digestMailService) {
        this.digestMailService = digestMailService;
    }

    // 스케줄 기다리지 않고 지금 바로 보내보고 싶을 때(테스트용)
    @PostMapping("/send-now")
    public Map<String, Boolean> sendNow() {
        boolean sent = digestMailService.sendDailyDigest();
        return Map.of("sent", sent);
    }
}
