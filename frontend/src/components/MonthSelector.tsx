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

  useEffect(() => {
    setYear(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    fetchActiveMonths(year).then((months) => setActiveMonths(new Set(months)));
  }, [year]);

  const selectMonth = (m: number) => {
    onChange(`${year}-${String(m).padStart(2, '0')}`);
  };

  return (
    <div className="month-selector">
      <div className="month-selector__year">
        <button className="icon-button" onClick={() => setYear((y) => y - 1)} aria-label="이전 연도">
          ‹
        </button>
        <span className="month-selector__year-label">{year}년</span>
        <button className="icon-button" onClick={() => setYear((y) => y + 1)} aria-label="다음 연도">
          ›
        </button>
      </div>

      <div className="month-grid">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const monthStr = `${year}-${String(m).padStart(2, '0')}`;
          const isSelected = year === selectedYear && m === selectedMonthNum;
          const hasData = activeMonths.has(monthStr);

          const classes = ['month-cell'];
          if (isSelected) classes.push('month-cell--selected');
          if (hasData) classes.push('month-cell--has-data');

          return (
            <button key={m} className={classes.join(' ')} onClick={() => selectMonth(m)}>
              {m}월
            </button>
          );
        })}
      </div>
    </div>
  );
}
