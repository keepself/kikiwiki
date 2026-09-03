package com.kikiwiki.backend.workout;

import java.math.BigDecimal;

public class WorkoutSetResponse {

    private Long id;
    private BigDecimal weightKg;
    private Integer reps;

    public WorkoutSetResponse(WorkoutSet set) {
        this.id = set.getId();
        this.weightKg = set.getWeightKg();
        this.reps = set.getReps();
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
}
