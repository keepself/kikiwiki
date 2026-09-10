package com.kikiwiki.backend.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MuscleInjuryRepository extends JpaRepository<MuscleInjury, Long> {

    Optional<MuscleInjury> findByMuscleGroupAndRecoveredAtIsNull(MuscleGroup muscleGroup);

    List<MuscleInjury> findAllByRecoveredAtIsNullOrderByInjuredAtAsc();

    Optional<MuscleInjury> findTopByMuscleGroupOrderByInjuredAtDesc(MuscleGroup muscleGroup);

    boolean existsBySourceRecordIdAndRecoveredAtIsNull(Long sourceRecordId);
}
