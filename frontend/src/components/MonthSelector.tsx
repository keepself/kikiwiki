import { useEffect, useState } from 'react';
import { fetchActiveMonths } from '../api/client';

interface Props {
  month: string; // "YYYY-MM"
  onChange: (month: string) => void;
}

export function MonthSelector({ month, onChange }: Props) {
  const [selectedYear, selectedMonthNum] = month.split('-').map(Number);
  const [year, setYear] = useState(selectedYear);
  const [activeMonths, setActiveMonths] = useState<Set<string>>(new Set());

  // 부모가 month를 외부에서 바꾸면 (예: 등록 후 다른 연도로 자동 이동) 그리드가 보여주는 연도도 따라감
  useEffect(() => {
    setYear(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  // 연도가 바뀔 때마다, 그 연도에 데이터가 있는 달 목록을 다시 불러옴
  useEffect(() => {
    fetchActiveMonths(year).then((months) => setActiveMonths(new Set(months)));
  }, [year]);

  const selectMonth = (m: number) => {
    const monthStr = `${year}-${String(m).padStart(2, '0')}`;
    onChange(monthStr);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button onClick={() => setYear((y) => y - 1)}>◀</button>
        <strong>{year}년</strong>
        <button onClick={() => setYear((y) => y + 1)}>▶</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 48px)', gap: '0.4rem' }}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const monthStr = `${year}-${String(m).padStart(2, '0')}`;
          const isSelected = year === selectedYear && m === selectedMonthNum;
          const hasData = activeMonths.has(monthStr);

          return (
            <button
              key={m}
              onClick={() => selectMonth(m)}
              style={{
                padding: '0.5rem 0',
                border: isSelected ? '2px solid seagreen' : '1px solid #ddd',
                background: hasData ? '#eaf6ee' : 'white',
                fontWeight: isSelected ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {m}월
            </button>
          );
        })}
      </div>
    </div>
  );
}
