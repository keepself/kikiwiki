import { useState } from 'react';
import type { MuscleGroup, WorkoutRecordInput, WorkoutStatus } from '../types/workout';
import { MUSCLE_GROUP_EXERCISES, MUSCLE_GROUP_LABELS, WORKOUT_STATUS_LABELS } from '../types/workout';

const MUSCLE_GROUPS: MuscleGroup[] = ['CHEST', 'BACK', 'LOWER_BODY', 'BICEPS', 'TRICEPS', 'SHOULDERS'];
const WORKOUT_STATUSES: WorkoutStatus[] = ['COMPLETED', 'INCOMPLETE', 'INJURED', 'SKIPPED'];

// 완료/목표 미달은 그날 한 종목이 최소 1개 있어야 하지만, 부상/패스는 종목 없이도 기록 가능
function requiresExercises(status: WorkoutStatus): boolean {
  return status === 'COMPLETED' || status === 'INCOMPLETE';
}

interface SetRow {
  weightKg: string;
  reps: string;
}

interface ExerciseRow {
  exerciseName: string;
  sets: SetRow[];
}

interface Props {
  initialValues?: WorkoutRecordInput;
  submitLabel?: string;
  onSubmit: (input: WorkoutRecordInput) => Promise<void>;
}

function emptyExercise(): ExerciseRow {
  return { exerciseName: '', sets: [{ weightKg: '', reps: '' }] };
}

function toExerciseRows(input?: WorkoutRecordInput): ExerciseRow[] {
  if (!input || input.exercises.length === 0) {
    return [emptyExercise()];
  }
  return input.exercises.map((exercise) => ({
    exerciseName: exercise.exerciseName,
    sets:
      exercise.sets.length === 0
        ? [{ weightKg: '', reps: '' }]
        : exercise.sets.map((set) => ({
            weightKg: set.weightKg != null ? String(set.weightKg) : '',
            reps: String(set.reps),
          })),
  }));
}

export function WorkoutRecordForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [workoutDate, setWorkoutDate] = useState(initialValues?.workoutDate ?? '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(initialValues?.muscleGroup ?? 'CHEST');
  const [status, setStatus] = useState<WorkoutStatus>(initialValues?.status ?? 'COMPLETED');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [exercises, setExercises] = useState<ExerciseRow[]>(toExerciseRows(initialValues));
  const [submitting, setSubmitting] = useState(false);

  const updateExerciseName = (exerciseIndex: number, value: string) => {
    setExercises((prev) => prev.map((ex, i) => (i === exerciseIndex ? { ...ex, exerciseName: value } : ex)));
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, emptyExercise()]);
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
  };

  // 등록 순서가 그대로 저장 순서가 됨 (배열 순서 = exerciseOrder)
  const moveExercise = (exerciseIndex: number, direction: -1 | 1) => {
    setExercises((prev) => {
      const targetIndex = exerciseIndex + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[exerciseIndex], next[targetIndex]] = [next[targetIndex], next[exerciseIndex]];
      return next;
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetRow, value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.map((set, j) => (j === setIndex ? { ...set, [field]: value } : set)) }
          : ex
      )
    );
  };

  const addSet = (exerciseIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { weightKg: last?.weightKg ?? '', reps: '' }] };
      })
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exerciseIndex ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) } : ex))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutDate) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const validExercises = exercises
      .filter((ex) => ex.exerciseName.trim() !== '')
      .map((ex) => ({
        exerciseName: ex.exerciseName,
        sets: ex.sets.filter((set) => set.reps !== ''),
      }))
      // 이름만 있고 세트가 하나도 없는 종목은 기록으로서 의미가 없어서 뺌 (종목별 기록 그래프 계산이 깨지는 원인이기도 함)
      .filter((ex) => ex.sets.length > 0);

    if (requiresExercises(status) && validExercises.length === 0) {
      alert('운동 종목을 세트와 함께 최소 1개 이상 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        workoutDate,
        muscleGroup,
        status,
        memo: memo || null,
        exercises: validExercises.map((ex) => ({
          exerciseName: ex.exerciseName,
          sets: ex.sets.map((set) => ({
            weightKg: set.weightKg ? Number(set.weightKg) : null,
            reps: Number(set.reps),
          })),
        })),
      });

      if (!isEditing) {
        setMemo('');
        setExercises([emptyExercise()]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>날짜</label>
        <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
      </div>

      <div className="form-field">
        <label>운동 부위</label>
        <div className="weekday-picker">
          {MUSCLE_GROUPS.map((group) => (
            <button
              type="button"
              key={group}
              className={`weekday-picker__day ${muscleGroup === group ? 'weekday-picker__day--selected' : ''}`}
              onClick={() => setMuscleGroup(group)}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>상태</label>
        <div className="weekday-picker">
          {WORKOUT_STATUSES.map((s) => (
            <button
              type="button"
              key={s}
              className={`weekday-picker__day ${status === s ? 'weekday-picker__day--selected' : ''}`}
              onClick={() => setStatus(s)}
            >
              {WORKOUT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>종목 {!requiresExercises(status) && '(선택)'}</label>
        <div className="workout-exercise-list">
          {exercises.map((exercise, exerciseIndex) => (
            <div className="workout-exercise-block" key={exerciseIndex}>
              <div className="workout-exercise-block__header">
                <div className="workout-exercise-block__reorder">
                  <button
                    type="button"
                    className="workout-exercise-block__reorder-btn"
                    onClick={() => moveExercise(exerciseIndex, -1)}
                    disabled={exerciseIndex === 0}
                    aria-label="위로 이동"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="workout-exercise-block__reorder-btn"
                    onClick={() => moveExercise(exerciseIndex, 1)}
                    disabled={exerciseIndex === exercises.length - 1}
                    aria-label="아래로 이동"
                  >
                    ▼
                  </button>
                </div>
                <input
                  type="text"
                  list="workout-exercise-options"
                  value={exercise.exerciseName}
                  onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                  placeholder="예: 벤치프레스 (목록에 없으면 직접 입력)"
                />
                <button
                  type="button"
                  className="workout-set-row__remove"
                  onClick={() => removeExercise(exerciseIndex)}
                  disabled={requiresExercises(status) && exercises.length === 1}
                  aria-label="종목 삭제"
                >
                  ×
                </button>
              </div>

              <div className="workout-set-rows">
                {exercise.sets.map((set, setIndex) => (
                  <div className="workout-set-row" key={setIndex}>
                    <span className="workout-set-row__label">{setIndex + 1}세트</span>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={set.weightKg}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, 'weightKg', e.target.value)}
                      placeholder="무게(kg)"
                    />
                    <input
                      type="number"
                      min={1}
                      value={set.reps}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                      placeholder="횟수"
                    />
                    <button
                      type="button"
                      className="workout-set-row__remove"
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                      disabled={requiresExercises(status) && exercise.sets.length === 1}
                      aria-label="세트 삭제"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="text-button" onClick={() => addSet(exerciseIndex)}>
                + 세트 추가
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="text-button" onClick={addExercise}>
          + 종목 추가
        </button>
        {/* 부위별 대표 운동 자동완성 - input의 list 속성으로 연결, 목록에 없으면 직접 입력해도 됨 */}
        <datalist id="workout-exercise-options">
          {MUSCLE_GROUP_EXERCISES[muscleGroup].map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div className="form-field">
        <label>메모 (선택)</label>
        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 가슴 데이" />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
