package com.kikiwiki.backend.workout;

import jakarta.persistence.*;

import java.math.BigDecimal;

// WorkoutExercise 하나(그날 기록한 종목 1개)에 속한 세트 1개 - 무게/횟수
@Entity
@Table(name = "workout_sets")
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(nullable = false)
    private Integer setOrder;

    // 맨몸운동(예: 턱걸이)은 무게 없이 횟수만 기록할 수 있어서 nullable
    private BigDecimal weightKg;

    @Column(nullable = false)
    private Integer reps;

    protected WorkoutSet() {
    }

    public WorkoutSet(Integer setOrder, BigDecimal weightKg, Integer reps) {
        this.setOrder = setOrder;
        this.weightKg = weightKg;
        this.reps = reps;
    }

    void assignTo(WorkoutExercise workoutExercise) {
        this.workoutExercise = workoutExercise;
    }

    public Long getId() {
        return id;
    }

    public Integer getSetOrder() {
        return setOrder;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public Integer getReps() {
        return reps;
    }
}
