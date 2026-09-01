package com.kikiwiki.backend.schedule;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/schedule-items")
public class ScheduleItemController {

    private final ScheduleItemRepository scheduleItemRepository;
    private final RoutineItemRepository routineItemRepository;

    public ScheduleItemController(ScheduleItemRepository scheduleItemRepository, RoutineItemRepository routineItemRepository) {
        this.scheduleItemRepository = scheduleItemRepository;
        this.routineItemRepository = routineItemRepository;
    }

    // 활성 루틴들의 요일 패턴에 맞는 날짜에 대해, 아직 생성된 적 없는 경우에만 ScheduleItem을 채워 넣음
    // (스케줄러 없이, 그 달을 조회하는 시점에 필요한 만큼만 생성)
    private void generateRoutineOccurrences(LocalDate monthStart, LocalDate monthEnd) {
        List<RoutineItem> routines = routineItemRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc();
        if (routines.isEmpty()) return;

        for (RoutineItem routine : routines) {
            var days = routine.getDaysOfWeekSet();
            for (LocalDate date = monthStart; !date.isAfter(monthEnd); date = date.plusDays(1)) {
                if (!days.contains(date.getDayOfWeek())) continue;
                if (scheduleItemRepository.existsByRoutineIdAndStartDate(routine.getId(), date)) continue;

                scheduleItemRepository.save(new ScheduleItem(routine.getTitle(), date, date, routine.getMemo(), routine.getId()));
            }
        }
    }

    private void validateDateRange(ScheduleItemRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시작일/종료일이 필요합니다.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "종료일은 시작일보다 빠를 수 없습니다.");
        }
    }

    @PostMapping
    public ResponseEntity<ScheduleItemResponse> create(@RequestBody ScheduleItemRequest request) {
        validateDateRange(request);

        ScheduleItem item = new ScheduleItem(request.getTitle(), request.getStartDate(), request.getEndDate(), request.getMemo());
        ScheduleItem saved = scheduleItemRepository.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ScheduleItemResponse(saved));
    }

    // month(예: "2026-09")와 하루라도 겹치는 일정을 모두 조회 (여러 날짜에 걸친 일정 포함)
    @GetMapping
    public List<ScheduleItemResponse> getAll(@RequestParam("month") String month) {
        YearMonth yearMonth = parseYearMonthOrThrow(month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        generateRoutineOccurrences(start, end);

        return scheduleItemRepository.findAllOverlapping(start, end)
                .stream()
                .map(ScheduleItemResponse::new)
                .toList();
    }

    private YearMonth parseYearMonthOrThrow(String month) {
        try {
            return YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month 형식이 올바르지 않습니다 (예: 2026-08): " + month);
        }
    }

    @PutMapping("/{id}")
    public ScheduleItemResponse update(@PathVariable("id") Long id, @RequestBody ScheduleItemRequest request) {
        validateDateRange(request);

        ScheduleItem item = scheduleItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다: " + id));

        item.update(request.getTitle(), request.getStartDate(), request.getEndDate(), request.getMemo());
        ScheduleItem updated = scheduleItemRepository.save(item);

        return new ScheduleItemResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        ScheduleItem item = scheduleItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다: " + id));

        item.softDelete();
        scheduleItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }
}
