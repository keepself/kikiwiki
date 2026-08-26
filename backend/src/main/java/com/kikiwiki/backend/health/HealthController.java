package com.kikiwiki.backend.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final DataSource dataSource;

    // Spring이 application-local.yml의 datasource 설정으로 만든 DataSource를 자동으로 주입해줌
    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        Map<String, String> result = new LinkedHashMap<>();
        result.put("backend", "OK");

        // 실제로 DB에 연결을 시도해서 살아있는지 확인
        try (Connection connection = dataSource.getConnection()) {
            result.put("database", connection.isValid(2) ? "OK" : "FAIL");
        } catch (Exception e) {
            result.put("database", "FAIL: " + e.getMessage());
        }

        return result;
    }
}