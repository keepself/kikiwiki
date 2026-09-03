package com.kikiwiki.backend.workout;

import java.math.BigDecimal;

public class CoachingSetSuggestion {

    private BigDecimal weightKg;
    private Integer reps;

    public CoachingSetSuggestion() {
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }
}
