package com.kikiwiki.backend.schedule;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    // 요일 값(1~7)은 @Valid에서 이미 검증됨 - 여기선 그냥 변환만 함
    private Set<DayOfWeek> toDayOfWeekSet(RoutineItemRequest request) {
        return request.getDaysOfWeek().stream().map(DayOfWeek::of).collect(Collectors.toSet());
    }

    @PostMapping
    public ResponseEntity<RoutineItemResponse> create(@Valid @RequestBody RoutineItemRequest request) {
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
    public RoutineItemResponse update(@PathVariable("id") Long id, @Valid @RequestBody RoutineItemRequest request) {
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
    // (여러 건을 지우는 작업이라 @Transactional로 묶어서, 중간에 실패하면 전부 롤백되게 함)
    @Transactional
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
