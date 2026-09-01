package com.kikiwiki.backend.schedule;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/routine-items")
public class RoutineItemController {

    private final RoutineItemRepository routineItemRepository;
    private final ScheduleItemRepository scheduleItemRepository;

    public RoutineItemController(RoutineItemRepository routineItemRepository, ScheduleItemRepository scheduleItemRepository) {
        this.routineItemRepository = routineItemRepository;
        this.scheduleItemRepository = scheduleItemRepository;
    }

    private Set<DayOfWeek> toDayOfWeekSet(RoutineItemRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 필수입니다.");
        }
        if (request.getDaysOfWeek() == null || request.getDaysOfWeek().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "반복할 요일을 하나 이상 선택해주세요.");
        }
        return request.getDaysOfWeek().stream().map(DayOfWeek::of).collect(Collectors.toSet());
    }

    @PostMapping
    public ResponseEntity<RoutineItemResponse> create(@RequestBody RoutineItemRequest request) {
        Set<DayOfWeek> daysOfWeek = toDayOfWeekSet(request);
        if (routineItemRepository.existsByTitleAndDeletedAtIsNull(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 같은 이름의 루틴이 있습니다: " + request.getTitle());
        }

        RoutineItem item = new RoutineItem(request.getTitle(), daysOfWeek, request.getMemo());
        RoutineItem saved = routineItemRepository.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(new RoutineItemResponse(saved));
    }

    @GetMapping
    public List<RoutineItemResponse> getAll() {
        return routineItemRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(RoutineItemResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public RoutineItemResponse update(@PathVariable("id") Long id, @RequestBody RoutineItemRequest request) {
        Set<DayOfWeek> daysOfWeek = toDayOfWeekSet(request);
        RoutineItem item = routineItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "루틴을 찾을 수 없습니다: " + id));

        if (routineItemRepository.existsByTitleAndDeletedAtIsNullAndIdNot(request.getTitle(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 같은 이름의 루틴이 있습니다: " + request.getTitle());
        }

        item.update(request.getTitle(), daysOfWeek, request.getMemo());
        RoutineItem updated = routineItemRepository.save(item);

        return new RoutineItemResponse(updated);
    }

    // 해지: 앞으로 새로 생성되는 것도 멈추고, 이 루틴에서 만들어졌던 캘린더 일정도 전부 같이 지움
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        RoutineItem item = routineItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "루틴을 찾을 수 없습니다: " + id));

        for (ScheduleItem occurrence : scheduleItemRepository.findAllByRoutineIdAndDeletedAtIsNull(id)) {
            occurrence.softDelete();
            scheduleItemRepository.save(occurrence);
        }

        item.softDelete();
        routineItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }
}
