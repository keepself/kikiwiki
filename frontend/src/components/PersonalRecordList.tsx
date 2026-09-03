import type { ExercisePersonalRecordSummary } from '../types/workout';

interface Props {
  records: ExercisePersonalRecordSummary[];
  onSelect: (exerciseName: string) => void;
  onDelete: (exerciseName: string) => Promise<void>;
}

export function PersonalRecordList({ records, onSelect, onDelete }: Props) {
  const handleDelete = async (exerciseName: string) => {
    if (confirm(`"${exerciseName}" 종목을 삭제할까요? 이 종목으로 기록된 모든 날짜의 세트가 함께 지워져요.`)) {
      await onDelete(exerciseName);
    }
  };

  if (records.length === 0) {
    return <div className="empty-state">아직 세트를 기록한 종목이 없어요.</div>;
  }

  return (
    <div className="personal-record-list">
      {records.map((record) => (
        <div className="exercise-history__pr" key={record.exerciseName}>
          <button type="button" className="exercise-history__pr-clickable" onClick={() => onSelect(record.exerciseName)}>
            <span className="exercise-history__pr-label">{record.exerciseName}</span>
            {record.personalRecord ? (
              <>
                <span className="exercise-history__pr-value tabular-nums">
                  {record.personalRecord.weightKg != null
                    ? `${record.personalRecord.weightKg}kg × ${record.personalRecord.reps}회`
                    : `${record.personalRecord.reps}회`}
                </span>
                <span className="exercise-history__pr-date">
                  {record.personalRecord.workoutDate.slice(5).replace('-', '/')}
                </span>
              </>
            ) : (
              <span className="exercise-history__pr-value">기록 없음</span>
            )}
          </button>
          <button
            type="button"
            className="exercise-history__pr-delete"
            onClick={() => handleDelete(record.exerciseName)}
            aria-label="종목 삭제"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
