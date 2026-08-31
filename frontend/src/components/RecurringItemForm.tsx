import { useEffect, useState } from 'react';
import type { Category } from '../types/transaction';
import type { RecurringItemInput } from '../types/recurringItem';
import { fetchCategories } from '../api/client';

interface Props {
  initialValues?: RecurringItemInput;
  submitLabel?: string;
  onSubmit: (input: RecurringItemInput) => Promise<void>;
}

export function RecurringItemForm({ initialValues, submitLabel, onSubmit }: Props) {
  const isEditing = !!initialValues;
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initialValues?.name ?? '');
  const [amount, setAmount] = useState(initialValues?.amount != null ? String(initialValues.amount) : '');
  const [categoryId, setCategoryId] = useState(
    initialValues?.categoryId != null ? String(initialValues.categoryId) : ''
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories('EXPENSE').then((list) => {
      setCategories(list);
      if (!initialValues) {
        setCategoryId(list.length > 0 ? String(list[0].id) : '');
      }
    });
  }, []);

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
    if (!categoryId) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name, amount: Number(amount), categoryId: Number(categoryId) });

      if (!isEditing) {
        setName('');
        setAmount('');
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
        <label>카테고리</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '저장 중...' : submitLabel ?? '등록하기'}
      </button>
    </form>
  );
}
