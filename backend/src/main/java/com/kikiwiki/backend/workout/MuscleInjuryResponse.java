package com.kikiwiki.backend.workout;

import java.time.LocalDateTime;

public class MuscleInjuryResponse {

    private MuscleGroup muscleGroup;
    private LocalDateTime injuredAt;
    private Long sourceRecordId;

    public MuscleInjuryResponse(MuscleInjury injury) {
        this.muscleGroup = injury.getMuscleGroup();
        this.injuredAt = injury.getInjuredAt();
        this.sourceRecordId = injury.getSourceRecordId();
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public LocalDateTime getInjuredAt() {
        return injuredAt;
    }

    public Long getSourceRecordId() {
        return sourceRecordId;
    }
}
