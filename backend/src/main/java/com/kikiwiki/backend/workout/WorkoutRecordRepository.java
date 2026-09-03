package com.kikiwiki.backend.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutRecordRepository extends JpaRepository<WorkoutRecord, Long> {

    List<WorkoutRecord> findAllByDeletedAtIsNullOrderByWorkoutDateDescCreatedAtDesc();

    Optional<WorkoutRecord> findByIdAndDeletedAtIsNull(Long id);
}
