import { useState } from 'react';
import type { Transaction } from '../types/transaction';
import { randomMoneyQuote } from '../moneyQuotes';

interface Props {
  transactions: Transaction[];
}

function getFace(balance: number): string {
  return balance >= 0 ? '😊' : '😥';
}

export function SummaryCard({ transactions }: Props) {
  // 컴포넌트가 처음 로드될 때(=새로고침할 때) 한 번만 뽑고, 리렌더링 중엔 유지
  const [quote] = useState(randomMoneyQuote);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="summary-card">
      <div className="summary-card__mood">
        <span className="summary-card__mood-face">{getFace(balance)}</span>
        <span className="summary-card__mood-text">{quote}</span>
      </div>

      <div className="summary-card__balance-value tabular-nums">
        {balance >= 0 ? '+' : ''}
        {balance.toLocaleString()}원
      </div>

      <div className="summary-card__row">
        <div className="summary-card__stat">
          <div className="summary-card__stat-label">수입</div>
          <div className="summary-card__stat-value tabular-nums text-income">
            {totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="summary-card__stat">
          <div className="summary-card__stat-label">지출</div>
          <div className="summary-card__stat-value tabular-nums text-expense">
            {totalExpense.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
