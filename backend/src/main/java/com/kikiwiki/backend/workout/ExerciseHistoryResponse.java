package com.kikiwiki.backend.workout;

import java.util.List;

public class ExerciseHistoryResponse {

    private String exerciseName;
    private List<ExerciseHistoryEntry> entries;
    private ExercisePersonalRecord personalRecord;

    public ExerciseHistoryResponse(String exerciseName, List<ExerciseHistoryEntry> entries, ExercisePersonalRecord personalRecord) {
        this.exerciseName = exerciseName;
        this.entries = entries;
        this.personalRecord = personalRecord;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public List<ExerciseHistoryEntry> getEntries() {
        return entries;
    }

    public ExercisePersonalRecord getPersonalRecord() {
        return personalRecord;
    }
}
