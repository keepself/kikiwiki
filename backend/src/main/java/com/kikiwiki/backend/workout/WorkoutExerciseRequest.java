package com.kikiwiki.backend.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class WorkoutExerciseRequest {

    @NotBlank(message = "운동 종목은 필수입니다.")
    private String exerciseName;

    @Valid
    private List<WorkoutSetRequest> sets;

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public List<WorkoutSetRequest> getSets() {
        return sets;
    }

    public void setSets(List<WorkoutSetRequest> sets) {
        this.sets = sets;
    }
}
