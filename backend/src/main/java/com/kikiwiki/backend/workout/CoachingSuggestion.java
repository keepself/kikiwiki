package com.kikiwiki.backend.workout;

import java.time.LocalDate;
import java.util.List;

// AI가 만들어준 다음 세션 계획 - 프론트에서 그대로 "운동 기록 추가" 폼에 채워넣는 초안으로 씀
public class CoachingSuggestion {

    private LocalDate suggestedDate;
    private MuscleGroup muscleGroup;
    private String memo;
    private List<CoachingExerciseSuggestion> exercises;

    public CoachingSuggestion() {
    }

    public LocalDate getSuggestedDate() {
        return suggestedDate;
    }

    public void setSuggestedDate(LocalDate suggestedDate) {
        this.suggestedDate = suggestedDate;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(MuscleGroup muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    public List<CoachingExerciseSuggestion> getExercises() {
        return exercises;
    }

    public void setExercises(List<CoachingExerciseSuggestion> exercises) {
        this.exercises = exercises;
    }
}
