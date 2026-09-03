package com.kikiwiki.backend.workout;

import java.math.BigDecimal;
import java.time.LocalDate;

// 종목별 개인 최고기록 - 무게가 있는 세트가 하나라도 있으면 추정 1RM(Epley 공식)이 가장 높은 세트,
// 맨몸 운동만 있었으면 최다 횟수 세트
public class ExercisePersonalRecord {

    private LocalDate workoutDate;
    private BigDecimal weightKg;
    private Integer reps;
    private Double estimatedOneRepMax;

    public ExercisePersonalRecord(LocalDate workoutDate, BigDecimal weightKg, Integer reps, Double estimatedOneRepMax) {
        this.workoutDate = workoutDate;
        this.weightKg = weightKg;
        this.reps = reps;
        this.estimatedOneRepMax = estimatedOneRepMax;
    }

    public LocalDate getWorkoutDate() {
        return workoutDate;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public Integer getReps() {
        return reps;
    }

    public Double getEstimatedOneRepMax() {
        return estimatedOneRepMax;
    }
}
