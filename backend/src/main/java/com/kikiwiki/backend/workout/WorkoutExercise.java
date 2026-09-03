package com.kikiwiki.backend.workout;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

// 하루 운동 기록(WorkoutRecord) 안의 종목 하나 (예: 벤치프레스) - 세트 여러 개를 가짐
@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_record_id", nullable = false)
    private WorkoutRecord workoutRecord;

    @Column(nullable = false)
    private Integer exerciseOrder;

    @Column(nullable = false)
    private String exerciseName;

    @OneToMany(mappedBy = "workoutExercise", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("setOrder ASC")
    private List<WorkoutSet> sets = new ArrayList<>();

    protected WorkoutExercise() {
    }

    public WorkoutExercise(Integer exerciseOrder, String exerciseName) {
        this.exerciseOrder = exerciseOrder;
        this.exerciseName = exerciseName;
    }

    void assignTo(WorkoutRecord workoutRecord) {
        this.workoutRecord = workoutRecord;
    }

    // 수정 시 세트 목록 전체를 새 목록으로 교체 (orphanRemoval이 빠진 세트를 알아서 지움)
    public void replaceSets(List<WorkoutSet> newSets) {
        sets.clear();
        for (WorkoutSet set : newSets) {
            set.assignTo(this);
            sets.add(set);
        }
    }

    public Long getId() {
        return id;
    }

    public Integer getExerciseOrder() {
        return exerciseOrder;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public List<WorkoutSet> getSets() {
        return sets;
    }
}
