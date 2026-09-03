package com.kikiwiki.backend.workout;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// 점진적 과부화 AI 코칭 - 사용자가 특정 하루 기록(카드) 하나를 골라 "이 기록으로 코칭받기"를 누르면
// 그 기록 전체를 Anthropic API(Claude Haiku)에 보내서 다음 세션 계획(초안)을 구조화된 형태로 받아옴.
// 자동으로 도는 게 아니라 사용자가 기록을 하나 골라 넘길 때만 호출됨.
// API 키가 없으면 에러 대신 "미설정" 상태로 응답해서 크레딧/키가 아직 없어도 화면은 완성해둘 수 있게 함.
@Service
public class CoachingService {

    private final WorkoutRecordRepository workoutRecordRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.anthropic.api-key:}")
    private String apiKey;

    @Value("${app.anthropic.model:claude-haiku-4-5}")
    private String model;

    public CoachingService(WorkoutRecordRepository workoutRecordRepository) {
        this.workoutRecordRepository = workoutRecordRepository;
    }

    public CoachingResponse generateProgressiveOverloadCoaching(Long recordId) {
        WorkoutRecord record = workoutRecordRepository.findByIdAndDeletedAtIsNull(recordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "운동 기록을 찾을 수 없습니다: " + recordId));

        if (apiKey == null || apiKey.isBlank()) {
            return CoachingResponse.notConfigured();
        }

        if (record.getExercises().isEmpty()) {
            return CoachingResponse.info("이 기록엔 종목이 없어서 코칭을 만들 수 없어요.");
        }

        try {
            CoachingSuggestion suggestion = callAnthropic(record);
            return CoachingResponse.of(suggestion);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 코칭 요청 중 오류가 발생했습니다: " + e.getMessage());
        } catch (IOException | RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 코칭 요청 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 이 기록 하나(종목/세트/상태/메모)를 그대로 요약해서 프롬프트에 담음
    private String buildRecordSummary(WorkoutRecord record) {
        StringBuilder summary = new StringBuilder();
        summary.append("날짜: ").append(record.getWorkoutDate()).append('\n');
        summary.append("부위: ").append(muscleGroupLabel(record.getMuscleGroup())).append('\n');
        summary.append("상태: ").append(statusLabel(record.getStatus())).append('\n');
        if (record.getMemo() != null && !record.getMemo().isBlank()) {
            summary.append("메모: ").append(record.getMemo()).append('\n');
        }
        summary.append("종목:\n");
        for (WorkoutExercise exercise : record.getExercises()) {
            String sets = exercise.getSets().stream()
                    .map(set -> (set.getWeightKg() != null ? set.getWeightKg() + "kg" : "맨몸") + "x" + set.getReps())
                    .collect(Collectors.joining(", "));
            summary.append("- ").append(exercise.getExerciseName()).append(": ").append(sets).append('\n');
        }
        return summary.toString();
    }

    private String statusLabel(WorkoutStatus status) {
        return switch (status) {
            case COMPLETED -> "완료";
            case INCOMPLETE -> "목표미달";
            case INJURED -> "부상";
            case SKIPPED -> "휴식";
        };
    }

    private String muscleGroupLabel(MuscleGroup group) {
        return switch (group) {
            case CHEST -> "가슴";
            case BACK -> "등";
            case LOWER_BODY -> "하체";
            case BICEPS -> "이두";
            case TRICEPS -> "삼두";
            case SHOULDERS -> "어깨";
        };
    }

    private CoachingSuggestion callAnthropic(WorkoutRecord record) throws IOException, InterruptedException {
        String recordSummary = buildRecordSummary(record);

        String systemPrompt = """
                너는 웨이트 트레이닝 코치야. 아래는 사용자가 실제로 수행한 하루 운동 기록이야.
                이 기록을 보고 같은 부위를 다음에 할 때의 점진적 과부화 목표를 세워줘.
                - 완료(계획한 세트/횟수를 다 채움): 무게를 2.5~5%% 올리거나 횟수를 1~2회 늘리도록 제안해.
                - 목표미달: 무게는 유지하고 횟수부터 채우도록 제안해.
                - 부상: 그 종목/부위는 강도를 크게 낮추거나 휴식을 권해.
                - 종목 구성은 원칙적으로 그대로 유지하되, 필요하면 살짝만 조정해도 돼.

                반드시 아래 JSON 형식으로만 답해. 코드블록이나 다른 설명 텍스트는 절대 포함하지 마:
                {"muscleGroup": "CHEST", "memo": "간단한 코칭 코멘트 (한글 1~2문장)", "exercises": [{"exerciseName": "종목명", "sets": [{"weightKg": 62.5, "reps": 10}]}]}

                muscleGroup은 반드시 다음 중 하나: CHEST, BACK, LOWER_BODY, BICEPS, TRICEPS, SHOULDERS.
                맨몸 운동의 weightKg은 null로 표기해.
                """;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", 700,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", recordSummary))
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException("Anthropic API 응답 오류 (" + response.statusCode() + "): " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String text = root.path("content").path(0).path("text").asText();

        CoachingSuggestion suggestion = objectMapper.readValue(stripCodeFence(text), CoachingSuggestion.class);
        // 기록 날짜가 아니라 "오늘" 기준 다음주 - 오래된 기록을 골라 코칭받아도 제안 날짜가 과거로 나오지 않게 함
        suggestion.setSuggestedDate(java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul")).plusDays(7));
        return suggestion;
    }

    // 지시했는데도 가끔 ```json ... ``` 로 감싸서 응답하는 경우를 대비한 방어 코드
    private String stripCodeFence(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*\\n?", "");
            trimmed = trimmed.replaceFirst("```\\s*$", "");
        }
        return trimmed.trim();
    }
}
