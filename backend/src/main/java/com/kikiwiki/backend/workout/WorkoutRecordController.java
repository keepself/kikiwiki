package com.kikiwiki.backend.workout;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/workout-records")
public class WorkoutRecordController {

    private final WorkoutRecordRepository workoutRecordRepository;
    private final CoachingService coachingService;

    public WorkoutRecordController(WorkoutRecordRepository workoutRecordRepository, CoachingService coachingService) {
        this.workoutRecordRepository = workoutRecordRepository;
        this.coachingService = coachingService;
    }

    // 특정 하루 기록 하나를 골라 "이 기록으로 코칭받기"를 누른 그 순간에만 호출되는 온디맨드 AI 코칭 - 자동 스케줄 없음
    @PostMapping("/{id}/coaching")
    public CoachingResponse getCoaching(@PathVariable("id") Long id) {
        return coachingService.generateProgressiveOverloadCoaching(id);
    }

    // 지금까지 기록한 모든 종목의 개인 최고기록을 한 번에 나열 - "종목별 기록" 카드의 기본 화면(클릭 없이 바로 보임)
    @GetMapping("/personal-records")
    public List<ExercisePersonalRecordSummary> getPersonalRecords() {
        Map<String, ExercisePersonalRecord> prByExercise = new LinkedHashMap<>();

        for (WorkoutRecord record : workoutRecordRepository.findAllByDeletedAtIsNullOrderByWorkoutDateDescCreatedAtDesc()) {
            for (WorkoutExercise exercise : record.getExercises()) {
                ExercisePersonalRecord current = prByExercise.get(exercise.getExerciseName());
                for (WorkoutSet set : exercise.getSets()) {
                    current = betterRecord(current, record.getWorkoutDate(), set);
                }
                prByExercise.put(exercise.getExerciseName(), current);
            }
        }

        return prByExercise.entrySet().stream()
                .map(entry -> new ExercisePersonalRecordSummary(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.getExerciseName().compareTo(b.getExerciseName()))
                .toList();
    }

    // 특정 종목 하나의 전체 이력(날짜순)과 개인 최고기록 - "종목별 기록"에서 종목을 클릭하면 모달로 열림
    @GetMapping("/exercises/{exerciseName}/history")
    public ExerciseHistoryResponse getExerciseHistory(@PathVariable("exerciseName") String exerciseName) {
        List<WorkoutRecord> recordsNewestFirst = workoutRecordRepository.findAllByDeletedAtIsNullOrderByWorkoutDateDescCreatedAtDesc();

        List<ExerciseHistoryEntry> entries = new ArrayList<>();
        ExercisePersonalRecord personalRecord = null;

        for (int i = recordsNewestFirst.size() - 1; i >= 0; i--) {
            WorkoutRecord record = recordsNewestFirst.get(i);
            for (WorkoutExercise exercise : record.getExercises()) {
                if (!exercise.getExerciseName().equals(exerciseName)) {
                    continue;
                }
                entries.add(new ExerciseHistoryEntry(
                        record.getWorkoutDate(),
                        exercise.getSets().stream().map(WorkoutSetResponse::new).toList()
                ));
                for (WorkoutSet set : exercise.getSets()) {
                    personalRecord = betterRecord(personalRecord, record.getWorkoutDate(), set);
                }
            }
        }

        return new ExerciseHistoryResponse(exerciseName, entries, personalRecord);
    }

    // "종목별 기록"에서 종목 하나를 통째로 삭제 - 그 이름으로 기록된 모든 날의 세트를 지움.
    // 날짜 기록 자체(부위/상태/메모)는 남기고 그 종목만 빠짐 - 다른 종목이 하나도 없어도 그날 기록은 유지됨
    @Transactional
    @DeleteMapping("/exercises/{exerciseName}")
    public ResponseEntity<Void> deleteExercise(@PathVariable("exerciseName") String exerciseName) {
        for (WorkoutRecord record : workoutRecordRepository.findAllByDeletedAtIsNullOrderByWorkoutDateDescCreatedAtDesc()) {
            List<WorkoutExercise> remaining = record.getExercises().stream()
                    .filter(exercise -> !exercise.getExerciseName().equals(exerciseName))
                    .toList();
            if (remaining.size() != record.getExercises().size()) {
                record.replaceExercises(remaining);
                workoutRecordRepository.save(record);
            }
        }
        return ResponseEntity.noContent().build();
    }

    // 무게가 있는 세트끼리는 추정 1RM(Epley 공식)으로, 맨몸 세트끼리는 횟수로 비교. 무게 있는 기록이
    // 하나라도 있으면 그쪽을 우선함 (맨몸 세트와는 단위가 달라 직접 비교할 수 없어서)
    private ExercisePersonalRecord betterRecord(ExercisePersonalRecord current, java.time.LocalDate date, WorkoutSet set) {
        if (set.getWeightKg() != null) {
            double oneRepMax = estimatedOneRepMax(set.getWeightKg(), set.getReps());
            if (current == null || current.getWeightKg() == null || current.getEstimatedOneRepMax() == null
                    || oneRepMax > current.getEstimatedOneRepMax()) {
                return new ExercisePersonalRecord(date, set.getWeightKg(), set.getReps(), oneRepMax);
            }
            return current;
        }

        if (current != null && current.getWeightKg() != null) {
            return current; // 무게 있는 기록이 이미 있으면 맨몸 세트는 후보에서 제외
        }
        if (current == null || set.getReps() > current.getReps()) {
            return new ExercisePersonalRecord(date, null, set.getReps(), null);
        }
        return current;
    }

    private double estimatedOneRepMax(BigDecimal weightKg, int reps) {
        return weightKg.doubleValue() * (1 + reps / 30.0);
    }

    @PostMapping
    public ResponseEntity<WorkoutRecordResponse> create(@Valid @RequestBody WorkoutRecordRequest request) {
        WorkoutRecord record = new WorkoutRecord(request.getWorkoutDate(), request.getMuscleGroup(), request.getStatus(), request.getMemo());
        record.replaceExercises(toExercises(request));
        WorkoutRecord saved = workoutRecordRepository.save(record);

        return ResponseEntity.status(HttpStatus.CREATED).body(new WorkoutRecordResponse(saved));
    }

    @GetMapping
    public List<WorkoutRecordResponse> getAll() {
        return workoutRecordRepository.findAllByDeletedAtIsNullOrderByWorkoutDateDescCreatedAtDesc()
                .stream()
                .map(WorkoutRecordResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public WorkoutRecordResponse update(@PathVariable("id") Long id, @Valid @RequestBody WorkoutRecordRequest request) {
        WorkoutRecord record = workoutRecordRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "운동 기록을 찾을 수 없습니다: " + id));

        record.update(request.getWorkoutDate(), request.getMuscleGroup(), request.getStatus(), request.getMemo());
        record.replaceExercises(toExercises(request));
        WorkoutRecord updated = workoutRecordRepository.save(record);

        return new WorkoutRecordResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        WorkoutRecord record = workoutRecordRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "운동 기록을 찾을 수 없습니다: " + id));

        record.softDelete();
        workoutRecordRepository.save(record);

        return ResponseEntity.noContent().build();
    }

    private List<WorkoutExercise> toExercises(WorkoutRecordRequest request) {
        List<WorkoutExerciseRequest> exerciseRequests = request.getExercises() != null ? request.getExercises() : List.of();
        List<WorkoutExercise> exercises = new ArrayList<>();
        for (int i = 0; i < exerciseRequests.size(); i++) {
            WorkoutExerciseRequest exerciseRequest = exerciseRequests.get(i);
            WorkoutExercise exercise = new WorkoutExercise(i + 1, exerciseRequest.getExerciseName());
            exercise.replaceSets(toSets(exerciseRequest.getSets()));
            exercises.add(exercise);
        }
        return exercises;
    }

    private List<WorkoutSet> toSets(List<WorkoutSetRequest> setRequests) {
        List<WorkoutSetRequest> requests = setRequests != null ? setRequests : List.of();
        return IntStream.range(0, requests.size())
                .mapToObj(i -> new WorkoutSet(i + 1, requests.get(i).getWeightKg(), requests.get(i).getReps()))
                .toList();
    }
}
