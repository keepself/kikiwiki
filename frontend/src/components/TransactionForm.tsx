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

  // 구분(수입/지출)이 바뀔 때마다 해당하는 카테고리 목록을 다시 불러옴
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px' }}>
      <label>
        금액
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="15000"
        />
      </label>

      <label>
        구분
        <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="EXPENSE">지출</option>
          <option value="INCOME">수입</option>
        </select>
      </label>

      <label>
        카테고리
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        메모
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="선택 입력"
        />
      </label>

      <label>
        날짜
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? '등록 중...' : '등록'}
      </button>
    </form>
  );
}
