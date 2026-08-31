import { useState } from 'react';
import type { RecurringItemInput } from '../types/recurringItem';

interface Props {
  initialValues?: RecurringItemInput;
  submitLabel?: string;
  onSubmit: (input: RecurringItemInput) => Promise<void>;
}

export function RecurringItemForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [name, setName] = useState(initialValues?.name ?? '');
  const [amount, setAmount] = useState(initialValues?.amount != null ? String(initialValues.amount) : '');
  const [dayOfMonth, setDayOfMonth] = useState(
    initialValues?.dayOfMonth != null ? String(initialValues.dayOfMonth) : ''
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert('이름은 필수입니다.');
      return;
    }
    if (!amount) {
      alert('금액을 입력해주세요.');
      return;
    }
    if (dayOfMonth && (Number(dayOfMonth) < 1 || Number(dayOfMonth) > 31)) {
      alert('결제일은 1~31 사이로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name, amount: Number(amount), dayOfMonth: dayOfMonth ? Number(dayOfMonth) : null });

      if (!isEditing) {
        setName('');
        setAmount('');
        setDayOfMonth('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="wishlist-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>이름</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 넷플릭스" />
      </div>

      <div className="form-field">
        <label>금액</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </div>

      <div className="form-field">
        <label>결제일 (선택)</label>
        <input
          type="number"
          min={1}
          max={31}
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
          placeholder="비워두면 추가하는 날짜로 등록"
        />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
