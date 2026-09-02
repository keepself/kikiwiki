import { useState } from 'react';
import type { TodoItemInput } from '../types/todoItem';

interface Props {
  initialValues?: TodoItemInput;
  submitLabel?: string;
  onSubmit: (input: TodoItemInput) => Promise<void>;
}

export function TodoItemForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('제목은 필수입니다.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title, memo: memo || null, dueDate: dueDate || null });

      if (!isEditing) {
        setTitle('');
        setMemo('');
        setDueDate('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>제목</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 보고서 작성" />
      </div>

      <div className="form-field">
        <label>마감기한 (선택)</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <div className="form-field">
        <label>메모 (선택)</label>
        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 금요일까지" />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
