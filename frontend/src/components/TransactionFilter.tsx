import { useEffect, useState } from 'react';
import type { Category, TransactionType } from '../types/transaction';
import { fetchCategories } from '../api/client';

interface Props {
  type: TransactionType | null;
  categoryId: number | null;
  searchQuery: string;
  availableDays: string[]; // 그 달에 실제로 거래가 있는 날짜만 (최신순)
  selectedDay: string | null;
  onTypeChange: (type: TransactionType | null) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onSearchChange: (query: string) => void;
  onSelectDay: (day: string | null) => void;
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDay(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

export function TransactionFilter({
  type,
  categoryId,
  searchQuery,
  availableDays,
  selectedDay,
  onTypeChange,
  onCategoryChange,
  onSearchChange,
  onSelectDay,
}: Props) {
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

      {availableDays.length > 0 && (
        <select
          className="filter-bar__day-select"
          value={selectedDay ?? ''}
          onChange={(e) => onSelectDay(e.target.value || null)}
        >
          <option value="">날짜로 이동</option>
          {availableDays.map((day) => (
            <option key={day} value={day}>
              {formatDay(day)}
            </option>
          ))}
        </select>
      )}

      <input
        type="text"
        className="filter-bar__search"
        placeholder="메모 검색"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
