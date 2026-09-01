import { useState } from 'react';
import type { ScheduleItemInput } from '../types/scheduleItem';

interface Props {
  initialValues?: ScheduleItemInput;
  submitLabel?: string;
  onSubmit: (input: ScheduleItemInput, addToBoard: boolean) => Promise<void>;
}

export function ScheduleItemForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? initialValues?.startDate ?? '');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [addToBoard, setAddToBoard] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    // 종료일이 시작일보다 빠르면(또는 아직 안 건드렸으면) 같이 밀어줌 - 보통 하루짜리 일정이 많아서 편의상
    if (!endDate || endDate < value) {
      setEndDate(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('제목은 필수입니다.');
      return;
    }
    if (!startDate || !endDate) {
      alert('날짜를 선택해주세요.');
      return;
    }
    if (endDate < startDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title, startDate, endDate, memo: memo || null }, addToBoard);

      if (!isEditing) {
        setTitle('');
        setMemo('');
        setAddToBoard(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 치과 예약" />
      </div>

      <div className="form-field">
        <label>시작일</label>
        <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
      </div>

      <div className="form-field">
        <label>종료일</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="form-field">
        <label>메모 (선택)</label>
        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 오후 3시" />
      </div>

      <label className="form-checkbox">
        <input type="checkbox" checked={addToBoard} onChange={(e) => setAddToBoard(e.target.checked)} />
        할 일 보드에도 추가
      </label>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
