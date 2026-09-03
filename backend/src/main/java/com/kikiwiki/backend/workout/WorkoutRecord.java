package com.kikiwiki.backend.workout;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// 하루 운동 기록 한 건 (예: 9/2 가슴 데이 - 벤치프레스 3세트, 인클라인 프레스 3세트 ...)
@Entity
@Table(name = "workout_records")
public class WorkoutRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate workoutDate;

    // 그날 타겟한 부위
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MuscleGroup muscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkoutStatus status;

    private String memo;

    @OneToMany(mappedBy = "workoutRecord", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("exerciseOrder ASC")
    private List<WorkoutExercise> exercises = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    protected WorkoutRecord() {
    }

    public WorkoutRecord(LocalDate workoutDate, MuscleGroup muscleGroup, WorkoutStatus status, String memo) {
        this.workoutDate = workoutDate;
        this.muscleGroup = muscleGroup;
        this.status = status;
        this.memo = memo;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(LocalDate workoutDate, MuscleGroup muscleGroup, WorkoutStatus status, String memo) {
        this.workoutDate = workoutDate;
        this.muscleGroup = muscleGroup;
        this.status = status;
        this.memo = memo;
    }

    // 수정 시 종목 목록 전체를 새 목록으로 교체 (orphanRemoval이 빠진 종목/세트를 알아서 지움)
    public void replaceExercises(List<WorkoutExercise> newExercises) {
        exercises.clear();
        for (WorkoutExercise exercise : newExercises) {
            exercise.assignTo(this);
            exercises.add(exercise);
        }
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
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

    public List<WorkoutExercise> getExercises() {
        return exercises;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
