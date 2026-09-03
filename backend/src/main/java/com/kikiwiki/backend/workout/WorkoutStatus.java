package com.kikiwiki.backend.workout;

public enum WorkoutStatus {
    COMPLETED,  // 완료 (계획한 세트/횟수를 다 채움)
    INCOMPLETE, // 목표 미달 (운동은 했지만 계획한 세트/횟수를 못 채움)
    INJURED,    // 부상 (통증 등으로 중단/조정)
    SKIPPED     // 휴식 (그날 운동을 하지 않음)
}
