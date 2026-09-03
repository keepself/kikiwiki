package com.kikiwiki.backend.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class WorkoutRecordRequest {

    @NotNull(message = "운동 날짜는 필수입니다.")
    private LocalDate workoutDate;

    @NotNull(message = "운동 부위는 필수입니다.")
    private MuscleGroup muscleGroup;

    @NotNull(message = "상태는 필수입니다.")
    private WorkoutStatus status;

    private String memo;

    // 완료/목표 미달은 종목이 있어야 하지만, 부상/패스는 종목 없이 등록될 수 있어서 여기선 강제하지 않음
    // (프론트에서 상태별로 필요한 만큼만 요구)
    @Valid
    private List<WorkoutExerciseRequest> exercises;

    public LocalDate getWorkoutDate() {
        return workoutDate;
    }

    public void setWorkoutDate(LocalDate workoutDate) {
        this.workoutDate = workoutDate;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(MuscleGroup muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public WorkoutStatus getStatus() {
        return status;
    }

    public void setStatus(WorkoutStatus status) {
        this.status = status;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    public List<WorkoutExerciseRequest> getExercises() {
        return exercises;
    }

    public void setExercises(List<WorkoutExerciseRequest> exercises) {
        this.exercises = exercises;
    }
}
