package com.kikiwiki.backend.workout;

public class CoachingResponse {

    private boolean configured;
    private String message;
    private CoachingSuggestion suggestion;

    // ANTHROPIC_API_KEY가 서버에 설정 안 돼있을 때 - 에러 대신 안내만 내려줌
    public static CoachingResponse notConfigured() {
        CoachingResponse response = new CoachingResponse();
        response.configured = false;
        response.message = "AI 코칭을 쓰려면 서버에 ANTHROPIC_API_KEY를 설정해야 해요.";
        return response;
    }

    // 설정은 됐지만 코칭을 만들 만한 기록이 없을 때(종목이 없는 날 등), 안내 메시지만 있는 경우
    public static CoachingResponse info(String message) {
        CoachingResponse response = new CoachingResponse();
        response.configured = true;
        response.message = message;
        return response;
    }

    public static CoachingResponse of(CoachingSuggestion suggestion) {
        CoachingResponse response = new CoachingResponse();
        response.configured = true;
        response.suggestion = suggestion;
        return response;
    }

    public boolean isConfigured() {
        return configured;
    }

    public String getMessage() {
        return message;
    }

    public CoachingSuggestion getSuggestion() {
        return suggestion;
    }
}
