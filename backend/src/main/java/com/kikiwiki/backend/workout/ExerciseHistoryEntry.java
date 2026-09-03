package com.kikiwiki.backend.workout;

import java.time.LocalDate;
import java.util.List;

public class ExerciseHistoryEntry {

    private LocalDate workoutDate;
    private List<WorkoutSetResponse> sets;

    public ExerciseHistoryEntry(LocalDate workoutDate, List<WorkoutSetResponse> sets) {
        this.workoutDate = workoutDate;
        this.sets = sets;
    }

    public LocalDate getWorkoutDate() {
        return workoutDate;
    }

    public List<WorkoutSetResponse> getSets() {
        return sets;
    }
}
