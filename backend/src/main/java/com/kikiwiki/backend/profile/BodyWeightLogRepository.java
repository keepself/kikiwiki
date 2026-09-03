package com.kikiwiki.backend.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BodyWeightLogRepository extends JpaRepository<BodyWeightLog, Long> {

    List<BodyWeightLog> findAllByDeletedAtIsNullOrderByRecordedDateAscCreatedAtAsc();

    Optional<BodyWeightLog> findByIdAndDeletedAtIsNull(Long id);
}
