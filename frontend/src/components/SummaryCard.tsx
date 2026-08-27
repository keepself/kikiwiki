import type { Transaction } from '../types/transaction';

interface Props {
  transactions: Transaction[];
}

export function SummaryCard({ transactions }: Props) {
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div>
        <div style={{ color: 'seagreen' }}>총수입</div>
        <strong>{totalIncome.toLocaleString()}원</strong>
      </div>
      <div>
        <div style={{ color: 'crimson' }}>총지출</div>
        <strong>{totalExpense.toLocaleString()}원</strong>
      </div>
      <div>
        <div>잔액</div>
        <strong style={{ color: balance >= 0 ? 'seagreen' : 'crimson' }}>
          {balance.toLocaleString()}원
        </strong>
      </div>
    </div>
  );
}
