import type { Transaction } from '../types/transaction';

interface Props {
  month: string; // 'YYYY-MM'
  transactions: Transaction[];
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return `${Math.round(amount / 1000) / 10}만`;
  }
  return amount.toLocaleString();
}

export function SpendingCalendar({ month, transactions }: Props) {
  const [year, monthNum] = month.split('-').map(Number);
  const firstWeekday = new Date(year, monthNum - 1, 1).getDay();
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const dailyExpense = new Map<number, number>();
  const dailyIncome = new Map<number, number>();
  for (const t of transactions) {
    const day = Number(t.transactionDate.slice(8, 10));
    const map = t.type === 'EXPENSE' ? dailyExpense : dailyIncome;
    map.set(day, (map.get(day) ?? 0) + t.amount);
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="spending-calendar">
      <div className="spending-calendar__weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="spending-calendar__grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="spending-calendar__cell" />;

          const dateStr = `${month}-${String(day).padStart(2, '0')}`;
          const expense = dailyExpense.get(day);
          const income = dailyIncome.get(day);

          return (
            <div
              key={day}
              className={`spending-calendar__cell ${dateStr === todayStr ? 'spending-calendar__cell--today' : ''}`}
            >
              <span className="spending-calendar__day">{day}</span>
              {income ? (
                <span className="spending-calendar__amount spending-calendar__amount--income tabular-nums">
                  +{formatAmount(income)}
                </span>
              ) : null}
              {expense ? (
                <span className="spending-calendar__amount spending-calendar__amount--expense tabular-nums">
                  -{formatAmount(expense)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
