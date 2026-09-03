import { useState } from 'react';

interface Props {
  value: string; // '' = 전체 기간, 아니면 "YYYY-MM"
  onChange: (value: string) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function MonthFilterSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(value ? Number(value.split('-')[0]) : now.getFullYear());

  const label = value ? `${value.split('-')[0]}년 ${Number(value.split('-')[1])}월` : '전체 기간';

  return (
    <div className="row-menu-wrap month-filter">
      <button type="button" className="month-filter__trigger" onClick={() => setOpen((v) => !v)}>
        {label}
      </button>

      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="row-menu-popover month-filter__popover">
            <div className="month-filter__year-row">
              <button type="button" className="icon-button" onClick={() => setYear((y) => y - 1)} aria-label="이전 연도">
                ‹
              </button>
              <span className="month-filter__year-label">{year}년</span>
              <button type="button" className="icon-button" onClick={() => setYear((y) => y + 1)} aria-label="다음 연도">
                ›
              </button>
            </div>

            <div className="month-filter__grid">
              {MONTHS.map((m) => {
                const monthStr = `${year}-${String(m).padStart(2, '0')}`;
                const isSelected = value === monthStr;
                return (
                  <button
                    type="button"
                    key={m}
                    className={`month-filter__cell ${isSelected ? 'month-filter__cell--selected' : ''}`}
                    onClick={() => {
                      onChange(monthStr);
                      setOpen(false);
                    }}
                  >
                    {m}월
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="month-filter__clear"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              전체 기간 보기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
