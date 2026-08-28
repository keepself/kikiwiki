import { useEffect, useState } from 'react';
import type { TransactionType } from '../types/transaction';
import { fetchCategorySummary, type CategorySummary } from '../api/client';

interface Props {
  month: string;
  refreshKey: number; // 이 값이 바뀔 때마다 강제로 다시 불러옴 (거래 등록/수정/삭제 시 부모가 증가시켜줌)
}

export function CategoryBarChart({ month, refreshKey }: Props) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [summary, setSummary] = useState<CategorySummary[]>([]);

  useEffect(() => {
    fetchCategorySummary(month, type).then(setSummary);
  }, [month, type, refreshKey]);

  if (summary.length === 0) {
    return (
      <div className="category-chart">
        <ChartTypeToggle type={type} onChange={setType} />
        <p className="empty-state" style={{ padding: '1.5rem' }}>
          {type === 'EXPENSE' ? '지출' : '수입'} 내역이 없어요.
        </p>
      </div>
    );
  }

  const maxAmount = Math.max(...summary.map((s) => s.totalAmount));

  return (
    <div className="category-chart">
      <ChartTypeToggle type={type} onChange={setType} />

      <div className="category-chart__bars">
        {summary.map((s) => (
          <div className="category-chart__row" key={s.categoryId}>
            <span className="category-chart__label">{s.categoryName}</span>
            <div className="category-chart__track">
              <div
                className={`category-chart__fill category-chart__fill--${type.toLowerCase()}`}
                style={{ width: `${(s.totalAmount / maxAmount) * 100}%` }}
              />
            </div>
            <span className="category-chart__amount tabular-nums">
              {s.totalAmount.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartTypeToggle({ type, onChange }: { type: TransactionType; onChange: (t: TransactionType) => void }) {
  return (
    <div className="chart-type-toggle">
      <button className={type === 'EXPENSE' ? 'active' : ''} onClick={() => onChange('EXPENSE')}>
        지출
      </button>
      <button className={type === 'INCOME' ? 'active' : ''} onClick={() => onChange('INCOME')}>
        수입
      </button>
    </div>
  );
}
