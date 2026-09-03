package com.kikiwiki.backend.profile;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BodyWeightLogResponse {

    private Long id;
    private LocalDate recordedDate;
    private BigDecimal weightKg;

    public BodyWeightLogResponse(BodyWeightLog log) {
        this.id = log.getId();
        this.recordedDate = log.getRecordedDate();
        this.weightKg = log.getWeightKg();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getRecordedDate() {
        return recordedDate;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }
}
