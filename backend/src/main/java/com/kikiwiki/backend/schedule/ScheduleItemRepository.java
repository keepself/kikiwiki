package com.kikiwiki.backend.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduleItemRepository extends JpaRepository<ScheduleItem, Long> {

    // 기간(startDate~endDate)이 조회 범위(monthStart~monthEnd)와 하루라도 겹치면 포함
    @Query("""
            SELECT s FROM ScheduleItem s
            WHERE s.deletedAt IS NULL
            AND s.startDate <= :monthEnd
            AND s.endDate >= :monthStart
            ORDER BY s.startDate ASC
            """)
    List<ScheduleItem> findAllOverlapping(
            @Param("monthStart") LocalDate monthStart,
            @Param("monthEnd") LocalDate monthEnd
    );

    Optional<ScheduleItem> findByIdAndDeletedAtIsNull(Long id);
}
