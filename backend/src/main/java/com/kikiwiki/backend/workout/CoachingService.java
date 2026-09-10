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
    private final MuscleInjuryService muscleInjuryService;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.anthropic.api-key:}")
    private String apiKey;

    @Value("${app.anthropic.model:claude-haiku-4-5}")
    private String model;

    public CoachingService(WorkoutRecordRepository workoutRecordRepository, MuscleInjuryService muscleInjuryService) {
        this.workoutRecordRepository = workoutRecordRepository;
        this.muscleInjuryService = muscleInjuryService;
    }

    public CoachingResponse generateProgressiveOverloadCoaching(Long recordId, java.time.LocalDate nextDate) {
        WorkoutRecord record = workoutRecordRepository.findByIdAndDeletedAtIsNull(recordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "운동 기록을 찾을 수 없습니다: " + recordId));

        if (apiKey == null || apiKey.isBlank()) {
            return CoachingResponse.notConfigured();
        }

        // 이 부위가 아직 부상에서 회복 안 됐으면, 회복 전까진 다음 계획을 만들지 않음(쉬어야 하니까)
        if (muscleInjuryService.isActive(record.getMuscleGroup())) {
            return CoachingResponse.info("이 부위는 아직 부상 회복 중이라 다음 계획을 만들지 않았어요. 회복 완료 후 다시 시도해주세요.");
        }

        if (record.getExercises().isEmpty()) {
            return CoachingResponse.info("이 기록엔 종목이 없어서 코칭을 만들 수 없어요.");
        }

        try {
            CoachingSuggestion suggestion = callAnthropic(record, nextDate);
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

        // 세트마다 목표 대비 실제 수행이 있으면 그걸로 종목별 판단이 가능하니, 모든 세트에 목표가
        // 있을 땐 전체 "상태" 라벨을 아예 안 보내서 AI가 그 라벨에 끌려가지 않게 함. 목표가 없는
        // 세트가 하나라도 있으면(첫 기록으로 추가한 종목 등 판단 근거가 없는 세트) 그 세트를 위해
        // 라벨을 같이 보냄 - 부상/휴식처럼 숫자로 판단할 수 없는 상태도 마찬가지
        boolean allSetsHaveTarget = record.getExercises().stream()
                .flatMap(exercise -> exercise.getSets().stream())
                .allMatch(set -> set.getTargetReps() != null);
        if (!allSetsHaveTarget || record.getStatus() == WorkoutStatus.INJURED || record.getStatus() == WorkoutStatus.SKIPPED) {
            summary.append("상태: ").append(statusLabel(record.getStatus())).append('\n');
        }

        if (record.getMemo() != null && !record.getMemo().isBlank()) {
            summary.append("메모: ").append(record.getMemo()).append('\n');
        }
        summary.append("종목 (실제 수행, 괄호 안은 그 세트의 목표):\n");
        for (WorkoutExercise exercise : record.getExercises()) {
            String sets = exercise.getSets().stream()
                    .map(this::formatSet)
                    .collect(Collectors.joining(", "));
            summary.append("- ").append(exercise.getExerciseName()).append(": ").append(sets).append('\n');
        }

        // 이 부위가 과거에 부상이 있었다가 회복된 적이 있으면 참고하라고 알려줌 - 회복 직후라면
        // 이전 무게로 바로 돌아가지 말고 낮춰서 복귀하도록 스스로 판단하게 함
        muscleInjuryService.findLastRecovered(record.getMuscleGroup()).ifPresent(injury ->
                summary.append("참고: 이 부위는 ")
                        .append(injury.getInjuredAt().toLocalDate())
                        .append("~")
                        .append(injury.getRecoveredAt().toLocalDate())
                        .append(" 부상이 있었다가 회복됐어요. 회복 직후라면 이전 무게로 바로 돌아가지 말고 낮춰서 안전하게 복귀하도록 제안해.\n")
        );

        return summary.toString();
    }

    // 세트 하나를 "실제 수행(목표)" 형태로 표기 - 종목/세트 단위로 목표 대비 실제를 비교할 수 있게 함.
    // 목표 값이 없는 세트(맨 처음 기록 등)는 실제 값만 표기함.
    private String formatSet(WorkoutSet set) {
        String actual = (set.getWeightKg() != null ? set.getWeightKg() + "kg" : "맨몸") + "x" + set.getReps();
        if (set.getTargetReps() == null) {
            return actual;
        }
        String target = (set.getTargetWeightKg() != null ? set.getTargetWeightKg() + "kg" : "맨몸") + "x" + set.getTargetReps();
        return actual + "(목표 " + target + ")";
    }

    private String statusLabel(WorkoutStatus status) {
        return switch (status) {
            case PLANNED -> "계획중";
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

    private CoachingSuggestion callAnthropic(WorkoutRecord record, java.time.LocalDate nextDate) throws IOException, InterruptedException {
        String recordSummary = buildRecordSummary(record);

        String systemPrompt = """
                너는 웨이트 트레이닝 코치야. 아래는 사용자가 실제로 수행한 하루 운동 기록이야.
                이 기록을 보고 "더블 프로그레션"(double progression) 방식으로 같은 부위를 다음에 할 때의 목표를 세워줘.

                진행 방향은 종목별로(세트에 목표가 있으면 세트별로) 따로 정해야 해 - 벤치프레스는
                성공했는데 인클라인 벤치프레스는 실패하는 것처럼 같은 날이라도 결과가 다를 수 있어.
                괄호로 목표가 같이 적힌 세트는 그 목표 대비 실제 수치로만 판단하고, "상태" 필드는
                절대 참고하지 마. "상태" 필드가 있는 건 오직 괄호로 목표가 안 적힌 세트(목표를 아직
                모르는 첫 기록, 부상, 휴식 등) 때문이니 그런 세트에 한해서만 "상태"를 참고해.

                각 종목의 목표 반복수 범위는 8~12회로 잡고:
                - 그 종목의 세트들이 목표 반복수 이상을 채웠고 아직 12회 미만이면: 무게는 그대로 두고 반복수만 1~2회 늘려.
                  (매번 무게를 올리는 게 아니라, 반복수부터 먼저 늘리는 게 기본이야.)
                - 그 종목의 세트들이 목표를 채웠고 이미 모두 12회 이상이면: 그때만 무게를 올리고, 반복수는 8회로 다시 낮춰.
                - 그 종목이 목표에 못 미쳤으면: 그 종목만 무게와 반복수 목표를 그대로 유지해서 같은 목표를 한 번 더 도전하게 해.
                - 부상: 그 종목/부위는 무게를 크게 줄이거나 휴식을 권해.
                - 종목 구성은 원칙적으로 그대로 유지하되, 필요하면 살짝만 조정해도 돼.

                무게를 올릴 땐 실제로 헬스장에 있는 증량 단위만 써야 해 - 바벨/원판은 한쪽에 최소 1.25kg
                원판을 끼우는 거라 전체 무게 기준 최소 증량 단위는 2.5kg이야. 9.5kg, 21.3kg처럼 실제로 만들
                수 없는 무게는 절대 제안하지 마. 애매하면 무게를 반올림하지 말고, 반복수만 늘리는 쪽을 선택해.

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
        // 사용자가 다음 운동 날짜를 직접 골랐으면 그 날짜를, 아니면 "오늘" 기준 다음주로(기록 날짜 기준이 아님 -
        // 오래된 기록을 골라 코칭받아도 제안 날짜가 과거로 나오지 않게 함)
        suggestion.setSuggestedDate(
                nextDate != null ? nextDate : java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul")).plusDays(7)
        );
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
