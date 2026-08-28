import { useEffect, useState } from 'react';
import type { Category, TransactionInput, TransactionType } from '../types/transaction';
import { fetchCategories } from '../api/client';

interface Props {
  onSubmit: (input: TransactionInput) => Promise<void>;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function TransactionForm({ onSubmit }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories(type).then((list) => {
      setCategories(list);
      setCategoryId(list.length > 0 ? String(list[0].id) : '');
    });
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId) {
      alert('금액과 카테고리는 필수입니다.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        type,
        categoryId: Number(categoryId),
        description,
        transactionDate,
      });

      setAmount('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>구분</label>
        <div className="type-toggle">
          <button
            type="button"
            className={`type-expense ${type === 'EXPENSE' ? 'active' : ''}`}
            onClick={() => setType('EXPENSE')}
          >
            지출
          </button>
          <button
            type="button"
            className={`type-income ${type === 'INCOME' ? 'active' : ''}`}
            onClick={() => setType('INCOME')}
          >
            수입
          </button>
        </div>
      </div>

      <div className="form-field">
        <label>금액</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="15000"
        />
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

      <div className="form-field">
        <label>메모</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="선택 입력"
        />
      </div>

      <div className="form-field">
        <label>날짜</label>
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
        />
      </div>

      <button type="submit" className="submit-button" disabled={submitting}>
        {submitting ? '등록 중...' : '등록하기'}
      </button>
    </form>
  );
}
