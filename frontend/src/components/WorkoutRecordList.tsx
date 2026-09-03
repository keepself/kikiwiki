import { useState } from 'react';
import type { WorkoutExercise, WorkoutRecord } from '../types/workout';
import { MUSCLE_GROUP_LABELS, WORKOUT_STATUS_LABELS } from '../types/workout';

interface Props {
  records: WorkoutRecord[];
  onEdit: (record: WorkoutRecord) => void;
  onDelete: (id: number) => Promise<void>;
  onRequestCoaching: (record: WorkoutRecord) => void;
  coachingLoadingId: number | null;
}

const PAGE_SIZE = 6;

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

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

function namesLine(record: WorkoutRecord): string {
  if (record.exercises.length === 0) {
    return WORKOUT_STATUS_LABELS[record.status];
  }
  const names = record.exercises.map((exercise) => exercise.exerciseName).join(', ');
  const sentence = `${withObjectParticle(names)} 했어요`;
  return record.status === 'COMPLETED' ? sentence : `${sentence} · ${WORKOUT_STATUS_LABELS[record.status]}`;
}

function formatSets(exercise: WorkoutExercise): string {
  return exercise.sets
    .map((set) => (set.weightKg != null ? `${set.weightKg}kg×${set.reps}` : `${set.reps}회`))
    .join(', ');
}

export function WorkoutRecordList({ records, onEdit, onDelete, onRequestCoaching, coachingLoadingId }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

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

          return (
            <div className="workout-journal-entry" key={record.id}>
              <div className="workout-journal-entry__head">
                <span className="workout-journal-entry__date">{dateLabel}</span>
                <span className="workout-journal-entry__weekday">{weekdayLabel}</span>
                <span className="transaction-row__category-badge transaction-row__category-badge--expense">
                  {MUSCLE_GROUP_LABELS[record.muscleGroup]}
                </span>
              </div>

              <div className="workout-journal-entry__names">{namesLine(record)}</div>

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
                  <div className="workout-journal-entry__actions">
                    {record.exercises.length > 0 && (
                      <button onClick={() => onRequestCoaching(record)} disabled={coachingLoadingId === record.id}>
                        {coachingLoadingId === record.id ? 'AI 분석 중...' : 'AI 코칭 받기'}
                      </button>
                    )}
                    <button onClick={() => onEdit(record)}>수정</button>
                    <button onClick={() => handleDelete(record.id)}>삭제</button>
                  </div>
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
