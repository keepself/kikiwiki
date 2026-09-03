package com.kikiwiki.backend.workout;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class WorkoutSetRequest {

    @DecimalMin(value = "0", message = "무게는 0 이상이어야 합니다.")
    private BigDecimal weightKg;

    @NotNull(message = "횟수는 필수입니다.")
    @Min(value = 1, message = "횟수는 1 이상이어야 합니다.")
    private Integer reps;

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
