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

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5h14M6 10h8M8.5 15.5h3" />
    </svg>
  );
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
  const [open, setOpen] = useState(false);

  // type 필터에 맞는 카테고리만 보여줌. 구분이 '전체'면 카테고리 전체 목록을 보여줌
  useEffect(() => {
    fetchCategories(type ?? undefined).then(setCategories);
  }, [type]);

  const handleTypeChange = (next: TransactionType | null) => {
    onTypeChange(next);
    onCategoryChange(null); // 구분이 바뀌면 이전에 고른 카테고리는 더 이상 안 맞을 수 있으니 초기화
  };

  const activeCount = [type, categoryId, selectedDay].filter((v) => v != null).length;

  return (
    <div className="filter-bar">
      <div className="row-menu-wrap">
        <button
          type="button"
          className={`filter-trigger ${activeCount > 0 ? 'filter-trigger--active' : ''}`}
          onClick={() => setOpen((v) => !v)}
        >
          <FilterIcon />
          {activeCount > 0 && <span className="filter-trigger__badge">{activeCount}</span>}
        </button>

        {open && (
          <>
            <div className="menu-backdrop" onClick={() => setOpen(false)} />
            <div className="row-menu-popover filter-popover">
              <div className="filter-popover__field">
                <label>구분</label>
                <div className="filter-popover__chip-row">
                  <button
                    type="button"
                    className={`chip ${type === null ? 'chip--selected' : ''}`}
                    onClick={() => handleTypeChange(null)}
                  >
                    전체
                  </button>
                  <button
                    type="button"
                    className={`chip ${type === 'EXPENSE' ? 'chip--selected' : ''}`}
                    onClick={() => handleTypeChange('EXPENSE')}
                  >
                    지출
                  </button>
                  <button
                    type="button"
                    className={`chip ${type === 'INCOME' ? 'chip--selected' : ''}`}
                    onClick={() => handleTypeChange('INCOME')}
                  >
                    수입
                  </button>
                </div>
              </div>

              <div className="filter-popover__field">
                <label>카테고리</label>
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

              {availableDays.length > 0 && (
                <div className="filter-popover__field">
                  <label>날짜</label>
                  <select value={selectedDay ?? ''} onChange={(e) => onSelectDay(e.target.value || null)}>
                    <option value="">날짜로 이동</option>
                    {availableDays.map((day) => (
                      <option key={day} value={day}>
                        {formatDay(day)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
