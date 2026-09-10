import { useState } from 'react';
import type { WorkoutExercise, WorkoutExerciseInput, WorkoutRecord } from '../types/workout';
import { MUSCLE_GROUP_LABELS, WORKOUT_STATUS_LABELS } from '../types/workout';

interface Props {
  records: WorkoutRecord[];
  onEdit: (record: WorkoutRecord) => void;
  onDelete: (id: number) => Promise<void>;
  // 완료/목표미달 체크 - 실제로 한 무게/횟수(exercises)와 결과를 반영한 다음 계획을 골라둔 날짜로 자동 생성함
  onCheckResult: (
    record: WorkoutRecord,
    result: 'COMPLETED' | 'INCOMPLETE',
    nextDate: string,
    exercises: WorkoutExerciseInput[]
  ) => Promise<void>;
  // 부상으로 표시 - 다음 계획 생성 없이 상태만 바꿈 (그 부위는 회복 완료 전까지 새 계획을 못 만듦)
  onMarkOther: (record: WorkoutRecord) => Promise<void>;
  // 완료/목표미달 체크의 "처리 중" 표시에 씀
  coachingLoadingId: number | null;
  // AI 코칭 호출이 실패해서 다음 계획을 못 만든 채로 남은 기록들 - 여기 있으면 "다시 시도" 배너를 보여줌
  coachingRetryIds?: Set<number>;
  onRetryCoaching?: (record: WorkoutRecord) => Promise<void>;
}

const PAGE_SIZE = 6;

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatJournalDate(dateStr: string): { dateLabel: string; weekdayLabel: string } {
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    dateLabel: `${date.getMonth() + 1}월 ${date.getDate()}일`,
    weekdayLabel: WEEKDAY_LABELS[date.getDay()],
  };
}

// 한글 받침 유무에 따라 을/를 붙이기 (예: "벤치프레스"+를, "스쿼트"+를, "런지"+를, "딥스"+를 등)
function withObjectParticle(text: string): string {
  const lastChar = text.charCodeAt(text.length - 1);
  if (lastChar >= 0xac00 && lastChar <= 0xd7a3) {
    const hasBatchim = (lastChar - 0xac00) % 28 !== 0;
    return text + (hasBatchim ? '을' : '를');
  }
  return `${text}를`;
}

// 상태는 이제 뱃지로 따로 보여주니, 여기선 "무엇을 했는지/할 예정인지"만 문장으로 씀
function namesLine(record: WorkoutRecord): string {
  if (record.exercises.length === 0) {
    return WORKOUT_STATUS_LABELS[record.status];
  }
  const names = record.exercises.map((exercise) => exercise.exerciseName).join(', ');
  return record.status === 'PLANNED' ? `${withObjectParticle(names)} 할 예정이에요` : `${withObjectParticle(names)} 했어요`;
}

function formatSets(exercise: WorkoutExercise): string {
  return exercise.sets
    .map((set) => (set.weightKg != null ? `${set.weightKg}kg×${set.reps}` : `${set.reps}회`))
    .join(', ');
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

export function WorkoutRecordList({
  records,
  onEdit,
  onDelete,
  onCheckResult,
  onMarkOther,
  coachingLoadingId,
  coachingRetryIds,
  onRetryCoaching,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // 완료는 "계획한 대로 다 했다"는 뜻이라 따로 고칠 게 없어서 바로 다음 날짜만 물어봄.
  // 목표미달을 누르면 어떤 종목이 얼마나 부족했는지 실제로 한 무게/횟수를 입력/수정하고 나서
  // 다음 운동 날짜를 물어봄(기본값 +7일, 취소는 없음 - "목표 운동"이 비는 경로는 만들지 않음)
  const [pendingCheck, setPendingCheck] = useState<{
    record: WorkoutRecord;
    result: 'COMPLETED' | 'INCOMPLETE';
    nextDate: string;
    exercises: WorkoutExerciseInput[];
  } | null>(null);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('이 운동 기록을 삭제할까요?')) {
      await onDelete(id);
    }
  };

  const startCheck = (record: WorkoutRecord, result: 'COMPLETED' | 'INCOMPLETE') => {
    setPendingCheck({
      record,
      result,
      nextDate: addDays(today(), 7),
      exercises: record.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        sets: exercise.sets.map((set) => ({
          weightKg: set.weightKg,
          reps: set.reps,
          targetWeightKg: set.targetWeightKg,
          targetReps: set.targetReps,
        })),
      })),
    });
  };

  const updateActualSet = (exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps', value: string) => {
    setPendingCheck((cur) => {
      if (!cur) return cur;
      const exercises = cur.exercises.map((exercise, exIdx) => {
        if (exIdx !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, setIdx) => {
            if (setIdx !== setIndex) return set;
            if (field === 'weightKg') {
              return { ...set, weightKg: value === '' ? null : Number(value) };
            }
            return { ...set, reps: value === '' ? 0 : Number(value) };
          }),
        };
      });
      return { ...cur, exercises };
    });
  };

  const confirmCheck = async () => {
    if (!pendingCheck) return;
    const { record, result, nextDate, exercises } = pendingCheck;
    setPendingCheck(null);
    await onCheckResult(record, result, nextDate, exercises);
  };

  if (records.length === 0) {
    return <div className="empty-state">등록된 운동 기록이 없어요.</div>;
  }

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRecords = records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="workout-journal-list">
        {visibleRecords.map((record) => {
          const { dateLabel, weekdayLabel } = formatJournalDate(record.workoutDate);
          const isExpanded = expandedIds.has(record.id);
          const isPlanned = record.status === 'PLANNED';
          const isChecking = coachingLoadingId === record.id;
          const isPendingThis = pendingCheck?.record.id === record.id;
          const needsCoachingRetry = coachingRetryIds?.has(record.id) ?? false;

          return (
            <div className="workout-journal-entry" key={record.id}>
              <div className="workout-journal-entry__head">
                <span className="workout-journal-entry__date">{dateLabel}</span>
                <span className="workout-journal-entry__weekday">{weekdayLabel}</span>
                <span className="transaction-row__category-badge transaction-row__category-badge--expense">
                  {MUSCLE_GROUP_LABELS[record.muscleGroup]}
                </span>
                <span className={`workout-status-badge workout-status-badge--${record.status.toLowerCase()}`}>
                  {WORKOUT_STATUS_LABELS[record.status]}
                </span>
              </div>

              <div className="workout-journal-entry__names">{namesLine(record)}</div>

              {needsCoachingRetry && onRetryCoaching && (
                <div className="workout-coaching-retry">
                  <span>다음 계획을 만드는 데 실패했어요.</span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => onRetryCoaching(record)}
                    disabled={isChecking}
                  >
                    {isChecking ? '재시도 중...' : '다시 시도'}
                  </button>
                </div>
              )}

              {isPendingThis && pendingCheck.result === 'INCOMPLETE' && (
                <div className="workout-nextdate-confirm workout-nextdate-confirm--edit">
                  <div className="workout-nextdate-confirm__header">
                    <span className="workout-nextdate-confirm__icon workout-nextdate-confirm__icon--fail">
                      <FailIcon />
                    </span>
                    <span className="workout-nextdate-confirm__text">어떤 종목이 얼마나 부족했는지 실제로 한 만큼 입력해주세요</span>
                  </div>

                  <div className="workout-actual-edit">
                    {pendingCheck.exercises.map((exercise, exIdx) => (
                      <div className="workout-actual-edit__row" key={exercise.exerciseName + exIdx}>
                        <span className="workout-actual-edit__name">{exercise.exerciseName}</span>
                        <div className="workout-actual-edit__sets">
                          {exercise.sets.map((set, setIdx) => (
                            <span className="workout-actual-edit__set" key={setIdx}>
                              <input
                                type="number"
                                className="workout-actual-edit__input"
                                value={set.weightKg ?? ''}
                                onChange={(e) => updateActualSet(exIdx, setIdx, 'weightKg', e.target.value)}
                                placeholder="맨몸"
                              />
                              kg×
                              <input
                                type="number"
                                className="workout-actual-edit__input workout-actual-edit__input--reps"
                                value={set.reps}
                                onChange={(e) => updateActualSet(exIdx, setIdx, 'reps', e.target.value)}
                              />
                              회
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="workout-nextdate-confirm__footer">
                    <span className="workout-nextdate-confirm__text">다음 {MUSCLE_GROUP_LABELS[record.muscleGroup]} 운동 날짜는?</span>
                    <input
                      type="date"
                      min={today()}
                      value={pendingCheck.nextDate}
                      onChange={(e) => setPendingCheck((cur) => (cur ? { ...cur, nextDate: e.target.value } : cur))}
                    />
                    <button type="button" className="text-button" onClick={confirmCheck}>
                      확인
                    </button>
                  </div>
                </div>
              )}

              {isPendingThis && pendingCheck.result === 'COMPLETED' && (
                <div className="workout-nextdate-confirm">
                  <span className="workout-nextdate-confirm__icon">
                    <CheckIcon />
                  </span>
                  <span className="workout-nextdate-confirm__text">다음 {MUSCLE_GROUP_LABELS[record.muscleGroup]} 운동 날짜는?</span>
                  <input
                    type="date"
                    min={today()}
                    value={pendingCheck.nextDate}
                    onChange={(e) => setPendingCheck((cur) => (cur ? { ...cur, nextDate: e.target.value } : cur))}
                  />
                  <button type="button" className="text-button" onClick={confirmCheck}>
                    확인
                  </button>
                </div>
              )}

              {isPlanned && !isPendingThis && (
                <div className="workout-checkfail-row">
                  <button
                    type="button"
                    className="workout-checkfail-btn workout-checkfail-btn--complete"
                    onClick={() => startCheck(record, 'COMPLETED')}
                    disabled={isChecking}
                  >
                    <CheckIcon /> {isChecking ? '처리 중...' : '완료'}
                  </button>
                  <button
                    type="button"
                    className="workout-checkfail-btn workout-checkfail-btn--fail"
                    onClick={() => startCheck(record, 'INCOMPLETE')}
                    disabled={isChecking}
                  >
                    <FailIcon /> {isChecking ? '처리 중...' : '목표 미달'}
                  </button>
                  <div className="row-menu-wrap">
                    <button
                      className="row-menu-trigger"
                      aria-label="메뉴"
                      onClick={() => setOpenMenuId((cur) => (cur === record.id ? null : record.id))}
                    >
                      ⋯
                    </button>
                    {openMenuId === record.id && (
                        <>
                          <div className="menu-backdrop" onClick={() => setOpenMenuId(null)} />
                          <div className="row-menu-popover">
                            <button className="row-menu-item" onClick={() => { onEdit(record); setOpenMenuId(null); }}>
                              수정
                            </button>
                            <button
                              className="row-menu-item"
                              onClick={() => { setOpenMenuId(null); onMarkOther(record); }}
                            >
                              부상
                            </button>
                            <button
                              className="row-menu-item row-menu-item--danger"
                              onClick={() => { setOpenMenuId(null); handleDelete(record.id); }}
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
              )}

              <button className="workout-journal-entry__toggle" onClick={() => toggleExpanded(record.id)}>
                {isExpanded ? '접기 ▴' : '자세히 보기 ▾'}
              </button>

              {isExpanded && (
                <div className="workout-journal-entry__detail">
                  {record.exercises.map((exercise) => (
                    <div key={exercise.id}>
                      <div className="workout-journal-detail__ex-name">{exercise.exerciseName}</div>
                      <div className="workout-journal-detail__sets">{formatSets(exercise)}</div>
                    </div>
                  ))}
                  {record.memo && <div className="workout-journal-detail__memo">{record.memo}</div>}

                  {!isPlanned && (
                    <div className="workout-journal-entry__actions">
                      <button onClick={() => onEdit(record)}>수정</button>
                      <button onClick={() => handleDelete(record.id)}>삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination__arrow"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`pagination__page ${p === currentPage ? 'pagination__page--active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="pagination__arrow"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
