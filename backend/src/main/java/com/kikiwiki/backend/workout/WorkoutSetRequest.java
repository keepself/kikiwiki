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

    // AI 코칭으로 만들어진 세트일 때만 값이 있음 - 직접 입력한 세트는 null 그대로 저장됨
    private BigDecimal targetWeightKg;
    private Integer targetReps;

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

    public BigDecimal getTargetWeightKg() {
        return targetWeightKg;
    }

    public void setTargetWeightKg(BigDecimal targetWeightKg) {
        this.targetWeightKg = targetWeightKg;
    }

    public Integer getTargetReps() {
        return targetReps;
    }

    public void setTargetReps(Integer targetReps) {
        this.targetReps = targetReps;
    }
}
