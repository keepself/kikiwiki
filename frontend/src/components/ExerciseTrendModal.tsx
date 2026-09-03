import type { ExerciseHistoryResult } from '../types/workout';
import { TrendLineChart } from './TrendLineChart';

interface Props {
  history: ExerciseHistoryResult;
}

type SetList = ExerciseHistoryResult['entries'][number]['sets'];

// 세트 하나의 "무게 강도"를 비교할 값 - 무게가 있으면 추정 1RM, 없으면(맨몸) 횟수를 그대로 씀
function bestValue(sets: SetList): number {
  return Math.max(...sets.map((set) => (set.weightKg != null ? set.weightKg * (1 + set.reps / 30) : set.reps)));
}

// 그래프 라벨/대표값에 쓸 값 - 그날 가장 무거웠던(또는 맨몸이면 가장 많이 한) 세트 하나
function representativeLabel(sets: SetList): string {
  const weighted = sets.filter((set) => set.weightKg != null);
  if (weighted.length > 0) {
    const heaviest = weighted.reduce((a, b) => ((b.weightKg ?? 0) > (a.weightKg ?? 0) ? b : a));
    return `${heaviest.weightKg}kg`;
  }
  return `${Math.max(...sets.map((set) => set.reps))}회`;
}

function formatSets(sets: SetList): string {
  return sets.map((set) => (set.weightKg != null ? `${set.weightKg}kg × ${set.reps}회` : `${set.reps}회`)).join(', ');
}

export function ExerciseTrendModal({ history }: Props) {
  const { personalRecord } = history;
  // 세트가 하나도 없는 기록(부상/휴식으로 종목 이름만 남은 날 등)은 그래프 계산에 넣으면 안 되므로 제외
  const entries = history.entries.filter((entry) => entry.sets.length > 0);

  if (entries.length === 0) {
    return <div className="empty-state">아직 기록이 없어요.</div>;
  }

  return (
    <div>
      <TrendLineChart
        points={entries.map((entry) => ({
          dateLabel: entry.workoutDate.slice(5).replace('-', '/'),
          valueLabel: representativeLabel(entry.sets),
          value: bestValue(entry.sets),
          highlighted: personalRecord != null && entry.workoutDate === personalRecord.workoutDate,
        }))}
        color="var(--color-accent)"
        highlightColor="var(--color-income)"
      />

      <div className="exercise-trend__list">
        {[...entries].reverse().map((entry, index) => (
          <div className="exercise-trend__row" key={index}>
            <span className="exercise-trend__row-date">{entry.workoutDate.slice(5).replace('-', '/')}</span>
            <span className="exercise-trend__row-value">{formatSets(entry.sets)}</span>
            {personalRecord && entry.workoutDate === personalRecord.workoutDate && (
              <span className="exercise-trend__row-pr">PR</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
