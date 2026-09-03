package com.kikiwiki.backend.workout;

import java.util.List;

public class WorkoutExerciseResponse {

    private Long id;
    private String exerciseName;
    private List<WorkoutSetResponse> sets;

    public WorkoutExerciseResponse(WorkoutExercise exercise) {
        this.id = exercise.getId();
        this.exerciseName = exercise.getExerciseName();
        this.sets = exercise.getSets().stream().map(WorkoutSetResponse::new).toList();
    }

    public Long getId() {
        return id;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public List<WorkoutSetResponse> getSets() {
        return sets;
    }
}
