package com.kikiwiki.backend.workout;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class WorkoutRecordResponse {

    private Long id;
    private LocalDate workoutDate;
    private MuscleGroup muscleGroup;
    private WorkoutStatus status;
    private String memo;
    private List<WorkoutExerciseResponse> exercises;
    private LocalDateTime createdAt;

    public WorkoutRecordResponse(WorkoutRecord record) {
        this.id = record.getId();
        this.workoutDate = record.getWorkoutDate();
        this.muscleGroup = record.getMuscleGroup();
        this.status = record.getStatus();
        this.memo = record.getMemo();
        this.exercises = record.getExercises().stream().map(WorkoutExerciseResponse::new).toList();
        this.createdAt = record.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getWorkoutDate() {
        return workoutDate;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public WorkoutStatus getStatus() {
        return status;
    }

    public String getMemo() {
        return memo;
    }

    public List<WorkoutExerciseResponse> getExercises() {
        return exercises;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
