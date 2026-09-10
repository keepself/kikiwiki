package com.kikiwiki.backend.workout;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/muscle-injuries")
public class MuscleInjuryController {

    private final MuscleInjuryService muscleInjuryService;

    public MuscleInjuryController(MuscleInjuryService muscleInjuryService) {
        this.muscleInjuryService = muscleInjuryService;
    }

    // 지금 회복 안 된(부상 중인) 부위 목록 - "목표 운동" 위 배너에 보여줌
    @GetMapping
    public List<MuscleInjuryResponse> getActive() {
        return muscleInjuryService.findActive().stream().map(MuscleInjuryResponse::new).toList();
    }

    @PostMapping("/{muscleGroup}/recover")
    public ResponseEntity<Void> recover(@PathVariable("muscleGroup") MuscleGroup muscleGroup) {
        muscleInjuryService.recover(muscleGroup);
        return ResponseEntity.noContent().build();
    }
}
