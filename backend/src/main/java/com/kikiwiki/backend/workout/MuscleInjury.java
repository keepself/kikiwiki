package com.kikiwiki.backend.workout;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// 부위별 "아직 회복 안 된 부상"을 추적함 - 운동 기록 하나(하루치)가 아니라 그 부위가 나을 때까지
// 계속 이어지는 상태라서 별도 엔티티로 둠. recoveredAt이 null이면 지금 부상 중
@Entity
@Table(name = "muscle_injuries")
public class MuscleInjury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", nullable = false)
    private MuscleGroup muscleGroup;

    @Column(nullable = false)
    private LocalDateTime injuredAt;

    private LocalDateTime recoveredAt;

    // 부상으로 표시된 그 기록의 id - 회복 완료를 누르면 이 기록을 기준으로 다음 계획을 만들어줌
    @Column(nullable = false)
    private Long sourceRecordId;

    protected MuscleInjury() {
    }

    public MuscleInjury(MuscleGroup muscleGroup, LocalDateTime injuredAt, Long sourceRecordId) {
        this.muscleGroup = muscleGroup;
        this.injuredAt = injuredAt;
        this.sourceRecordId = sourceRecordId;
    }

    public void recover(LocalDateTime recoveredAt) {
        this.recoveredAt = recoveredAt;
    }

    public Long getId() {
        return id;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public LocalDateTime getInjuredAt() {
        return injuredAt;
    }

    public LocalDateTime getRecoveredAt() {
        return recoveredAt;
    }

    public Long getSourceRecordId() {
        return sourceRecordId;
    }
}
