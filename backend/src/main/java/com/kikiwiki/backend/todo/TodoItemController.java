package com.kikiwiki.backend.todo;

import com.kikiwiki.backend.schedule.ScheduleItemRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/todo-items")
public class TodoItemController {

    private final TodoItemRepository todoItemRepository;
    private final ScheduleItemRepository scheduleItemRepository;

    public TodoItemController(TodoItemRepository todoItemRepository, ScheduleItemRepository scheduleItemRepository) {
        this.todoItemRepository = todoItemRepository;
        this.scheduleItemRepository = scheduleItemRepository;
    }

    @PostMapping
    public ResponseEntity<TodoItemResponse> create(@Valid @RequestBody TodoItemRequest request) {
        TodoItem item = new TodoItem(request.getTitle(), request.getMemo(), request.getDueDate(), request.getLinkedScheduleItemId());
        TodoItem saved = todoItemRepository.save(item);

        return ResponseEntity.status(HttpStatus.CREATED).body(new TodoItemResponse(saved));
    }

    @GetMapping
    public List<TodoItemResponse> getAll() {
        return todoItemRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(TodoItemResponse::new)
                .toList();
    }

    @PutMapping("/{id}")
    public TodoItemResponse update(@PathVariable("id") Long id, @Valid @RequestBody TodoItemRequest request) {
        TodoItem item = todoItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "할 일을 찾을 수 없습니다: " + id));

        item.update(request.getTitle(), request.getMemo(), request.getDueDate());
        TodoItem updated = todoItemRepository.save(item);

        return new TodoItemResponse(updated);
    }

    // 칸반 보드에서 드래그로 상태만 바꿀 때
    @PatchMapping("/{id}/status")
    public TodoItemResponse updateStatus(@PathVariable("id") Long id, @Valid @RequestBody TodoStatusRequest request) {
        TodoItem item = todoItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "할 일을 찾을 수 없습니다: " + id));

        item.updateStatus(request.getStatus());
        TodoItem updated = todoItemRepository.save(item);

        return new TodoItemResponse(updated);
    }

    // cascadeSchedule=false(기본): 보관 - 할 일만 소프트 삭제.
    // cascadeSchedule=true: 진짜 삭제 - 연결된 캘린더 일정이 있으면 그것도 같이 소프트 삭제.
    // (두 건을 지우는 작업이라 @Transactional로 묶어서, 중간에 실패하면 전부 롤백되게 함)
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") Long id,
            @RequestParam(value = "cascadeSchedule", defaultValue = "false") boolean cascadeSchedule
    ) {
        TodoItem item = todoItemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "할 일을 찾을 수 없습니다: " + id));

        if (cascadeSchedule && item.getLinkedScheduleItemId() != null) {
            scheduleItemRepository.findByIdAndDeletedAtIsNull(item.getLinkedScheduleItemId())
                    .ifPresent(scheduleItem -> {
                        scheduleItem.softDelete();
                        scheduleItemRepository.save(scheduleItem);
                    });
        }

        item.softDelete();
        todoItemRepository.save(item);

        return ResponseEntity.noContent().build();
    }

    // 보관함: 사용자가 직접 보관 처리한 항목들 (실제로 지워진 게 아니라 여기서 계속 조회/복원 가능)
    @GetMapping("/archived")
    public List<TodoItemResponse> getArchived() {
        return todoItemRepository.findAllByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(TodoItemResponse::new)
                .toList();
    }

    @PostMapping("/{id}/restore")
    public TodoItemResponse restore(@PathVariable("id") Long id) {
        TodoItem item = todoItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "할 일을 찾을 수 없습니다: " + id));

        item.restore();
        TodoItem restored = todoItemRepository.save(item);

        return new TodoItemResponse(restored);
    }
}
