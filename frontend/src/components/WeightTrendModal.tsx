import { useState } from 'react';
import type { BodyWeightLog, BodyWeightLogInput } from '../types/profile';
import { TrendLineChart } from './TrendLineChart';

interface Props {
  logs: BodyWeightLog[]; // 날짜 오름차순 (오래된 것부터)
  onAdd: (input: BodyWeightLogInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function WeightTrendModal({ logs, onAdd, onDelete }: Props) {
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setSubmitting(true);
    try {
      await onAdd({ recordedDate: date, weightKg: Number(weight) });
      setWeight('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form className="weight-trend__add-form" onSubmit={handleAdd}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input
          type="number"
          step="0.1"
          min={1}
          placeholder="몸무게(kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <button type="submit" className="action-button" disabled={submitting}>
          {submitting ? '추가 중...' : '추가'}
        </button>
      </form>

      {logs.length === 0 ? (
        <div className="empty-state">아직 기록이 없어요.</div>
      ) : (
        <>
          <TrendLineChart
            points={logs.map((log, index) => ({
              dateLabel: log.recordedDate.slice(5).replace('-', '/'),
              valueLabel: `${log.weightKg}kg`,
              value: log.weightKg,
              highlighted: index === logs.length - 1,
            }))}
          />

          <div className="exercise-trend__list">
            {[...logs].reverse().map((log) => (
              <div className="exercise-trend__row" key={log.id}>
                <span className="exercise-trend__row-date">{log.recordedDate.slice(5).replace('-', '/')}</span>
                <span className="exercise-trend__row-value tabular-nums">{log.weightKg}kg</span>
                <button
                  type="button"
                  className="exercise-trend__row-delete"
                  onClick={() => onDelete(log.id)}
                  aria-label="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
