package com.kikiwiki.backend.profile;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BodyWeightLogRequest {

    @NotNull(message = "날짜는 필수입니다.")
    private LocalDate recordedDate;

    @NotNull(message = "몸무게는 필수입니다.")
    @DecimalMin(value = "1", message = "몸무게는 1kg 이상이어야 합니다.")
    private BigDecimal weightKg;

    public LocalDate getRecordedDate() {
        return recordedDate;
    }

    public void setRecordedDate(LocalDate recordedDate) {
        this.recordedDate = recordedDate;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }
}
