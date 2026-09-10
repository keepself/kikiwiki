package com.kikiwiki.backend.workout;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MuscleInjuryService {

    private final MuscleInjuryRepository muscleInjuryRepository;

    public MuscleInjuryService(MuscleInjuryRepository muscleInjuryRepository) {
        this.muscleInjuryRepository = muscleInjuryRepository;
    }

    // 운동 기록을 "부상"으로 표시할 때 호출됨 - 이미 그 부위가 부상 중이면 그대로 두고(중복 생성 안 함),
    // 아니면 새로 하나 시작함. sourceRecordId는 회복 완료 시 그 기록을 기준으로 다음 계획을 만들기 위함
    public void ensureActiveInjury(MuscleGroup muscleGroup, Long sourceRecordId) {
        if (muscleInjuryRepository.findByMuscleGroupAndRecoveredAtIsNull(muscleGroup).isEmpty()) {
            muscleInjuryRepository.save(new MuscleInjury(muscleGroup, LocalDateTime.now(), sourceRecordId));
        }
    }

    public boolean isActive(MuscleGroup muscleGroup) {
        return muscleInjuryRepository.findByMuscleGroupAndRecoveredAtIsNull(muscleGroup).isPresent();
    }

    public void recover(MuscleGroup muscleGroup) {
        muscleInjuryRepository.findByMuscleGroupAndRecoveredAtIsNull(muscleGroup)
                .ifPresent(injury -> {
                    injury.recover(LocalDateTime.now());
                    muscleInjuryRepository.save(injury);
                });
    }

    public List<MuscleInjury> findActive() {
        return muscleInjuryRepository.findAllByRecoveredAtIsNullOrderByInjuredAtAsc();
    }

    // 이 기록이 아직 회복 안 된 부상의 원본(sourceRecordId)인지 - 맞다면 삭제를 막아야 함.
    // 지우면 "회복 완료" 때 이 기록을 기준으로 다음 계획을 만들 수 없게 되기 때문
    public boolean isActiveInjurySource(Long recordId) {
        return muscleInjuryRepository.existsBySourceRecordIdAndRecoveredAtIsNull(recordId);
    }

    // 코칭 프롬프트에 "최근에 이 부위가 부상에서 회복됐다"는 걸 참고로 넣어주기 위함 -
    // 지금 부상 중이 아니면서, 과거에 회복된 이력이 있는 가장 최근 건만 봄
    public Optional<MuscleInjury> findLastRecovered(MuscleGroup muscleGroup) {
        return muscleInjuryRepository.findTopByMuscleGroupOrderByInjuredAtDesc(muscleGroup)
                .filter(injury -> injury.getRecoveredAt() != null);
    }
}
