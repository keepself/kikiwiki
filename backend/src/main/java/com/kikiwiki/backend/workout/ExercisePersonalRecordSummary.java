package com.kikiwiki.backend.workout;

public class ExercisePersonalRecordSummary {

    private String exerciseName;
    private ExercisePersonalRecord personalRecord;

    public ExercisePersonalRecordSummary(String exerciseName, ExercisePersonalRecord personalRecord) {
        this.exerciseName = exerciseName;
        this.personalRecord = personalRecord;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public ExercisePersonalRecord getPersonalRecord() {
        return personalRecord;
    }
}
