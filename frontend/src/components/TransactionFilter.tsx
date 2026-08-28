import { useEffect, useState } from 'react';
import type { Category, TransactionType } from '../types/transaction';
import { fetchCategories } from '../api/client';

interface Props {
  type: TransactionType | null;
  categoryId: number | null;
  onTypeChange: (type: TransactionType | null) => void;
  onCategoryChange: (categoryId: number | null) => void;
}

export function TransactionFilter({ type, categoryId, onTypeChange, onCategoryChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  // type 필터에 맞는 카테고리만 보여줌. 구분이 '전체'면 카테고리 전체 목록을 보여줌
  useEffect(() => {
    fetchCategories(type ?? undefined).then(setCategories);
  }, [type]);

  const handleTypeChange = (next: TransactionType | null) => {
    onTypeChange(next);
    onCategoryChange(null); // 구분이 바뀌면 이전에 고른 카테고리는 더 이상 안 맞을 수 있으니 초기화
  };

  return (
    <div className="filter-bar">
      <select
        value={type ?? ''}
        onChange={(e) => handleTypeChange(e.target.value ? (e.target.value as TransactionType) : null)}
      >
        <option value="">전체</option>
        <option value="EXPENSE">지출</option>
        <option value="INCOME">수입</option>
      </select>

      <select
        value={categoryId ?? ''}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">전체 카테고리</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
