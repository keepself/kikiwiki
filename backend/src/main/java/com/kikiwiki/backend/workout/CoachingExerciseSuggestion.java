package com.kikiwiki.backend.workout;

import java.util.List;

public class CoachingExerciseSuggestion {

    private String exerciseName;
    private List<CoachingSetSuggestion> sets;

    public CoachingExerciseSuggestion() {
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public List<CoachingSetSuggestion> getSets() {
        return sets;
    }

    public void setSets(List<CoachingSetSuggestion> sets) {
        this.sets = sets;
    }
}
