package com.kikiwiki.backend.workout;

import java.math.BigDecimal;

public class WorkoutSetResponse {

    private Long id;
    private BigDecimal weightKg;
    private Integer reps;
    private BigDecimal targetWeightKg;
    private Integer targetReps;

    public WorkoutSetResponse(WorkoutSet set) {
        this.id = set.getId();
        this.weightKg = set.getWeightKg();
        this.reps = set.getReps();
        this.targetWeightKg = set.getTargetWeightKg();
        this.targetReps = set.getTargetReps();
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public Integer getReps() {
        return reps;
    }

    public BigDecimal getTargetWeightKg() {
        return targetWeightKg;
    }

    public Integer getTargetReps() {
        return targetReps;
    }
}
