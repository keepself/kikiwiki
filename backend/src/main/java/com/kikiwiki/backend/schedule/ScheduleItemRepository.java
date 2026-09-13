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

    // 소프트 삭제된 것도 포함해서 확인 - 하루 예외로 지운 날짜에 루틴이 다시 만들어지는 걸 막기 위함
    boolean existsByRoutineIdAndStartDate(Long routineId, LocalDate startDate);

    // 루틴 해지 시 "앞으로 안 한다"는 의미로 오늘 이후(오늘 포함) 일정만 같이 지움 -
    // 지난 일정은 실제로 했던 기록이라 루틴을 끊어도 캘린더 이력엔 남겨둠
    List<ScheduleItem> findAllByRoutineIdAndDeletedAtIsNullAndStartDateGreaterThanEqual(Long routineId, LocalDate fromDate);

    // 마감 알림 다이제스트용 - 특정 날짜에 시작하는 일정
    List<ScheduleItem> findAllByStartDateAndDeletedAtIsNull(LocalDate startDate);

    // 검색 - 월 구분 없이 전체 기간에서 제목/메모에 키워드가 들어간 일정을 찾음(대소문자 구분 안 함)
    @Query("""
            SELECT s FROM ScheduleItem s
            WHERE s.deletedAt IS NULL
            AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%'))
                 OR LOWER(s.memo) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY s.startDate DESC
            """)
    List<ScheduleItem> search(@Param("query") String query);
}
