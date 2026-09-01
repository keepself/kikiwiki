import { useState } from 'react';
import type { RoutineItemInput } from '../types/routineItem';

interface Props {
  initialValues?: RoutineItemInput;
  submitLabel?: string;
  onSubmit: (input: RoutineItemInput) => Promise<void>;
}

const WEEKDAY_OPTIONS = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 7, label: '일' },
];

export function RoutineItemForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialValues?.daysOfWeek ?? []);
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('제목은 필수입니다.');
      return;
    }
    if (daysOfWeek.length === 0) {
      alert('반복할 요일을 하나 이상 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title, daysOfWeek, memo: memo || null });

      if (!isEditing) {
        setTitle('');
        setDaysOfWeek([]);
        setMemo('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 헬스장" />
      </div>

      <div className="form-field">
        <label>반복 요일</label>
        <div className="weekday-picker">
          {WEEKDAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`weekday-picker__day ${daysOfWeek.includes(opt.value) ? 'weekday-picker__day--selected' : ''}`}
              onClick={() => toggleDay(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>메모 (선택)</label>
        <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 오후 7시" />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
