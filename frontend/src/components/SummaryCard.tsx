import { useEffect, useState } from 'react';
import type { Transaction } from '../types/transaction';
import { fetchBudget, updateBudget } from '../api/client';

interface Props {
  transactions: Transaction[];
  previousMonthTransactions: Transaction[];
}

function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export function SummaryCard({ transactions, previousMonthTransactions }: Props) {
  const [savingsMode, setSavingsMode] = useState(false);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    fetchBudget().then(setBudget).catch(() => {});
  }, []);

  const totalIncome = sumByType(transactions, 'INCOME');
  const totalExpense = sumByType(transactions, 'EXPENSE');
  const balance = totalIncome - totalExpense;

  const hasPreviousData = previousMonthTransactions.length > 0;
  const previousExpense = sumByType(previousMonthTransactions, 'EXPENSE');
  const diff = totalExpense - previousExpense;
  const spentMore = diff > 0;

  // 지난달보다 더 썼으면 울고, 덜 썼으면(또는 비교할 지난달 기록이 없으면) 웃음
  const face = hasPreviousData && spentMore ? '😢' : '😊';

  const handleSaveBudget = async () => {
    const amount = Number(budgetInput);
    if (!budgetInput || !Number.isFinite(amount) || amount <= 0) {
      alert('올바른 예산 금액을 입력해주세요.');
      return;
    }
    const saved = await updateBudget(amount);
    setBudget(saved);
    setBudgetInput('');
  };

  const remaining = budget != null ? budget - totalExpense : null;

  return (
    <div className={`summary-card ${savingsMode ? 'summary-card--savings' : ''}`}>
      <div className="summary-card__toggle-row">
        <div className="toggle-switch-group">
          <span className="toggle-switch-group__label">절약모드</span>
          <button
            className={`toggle-switch ${savingsMode ? 'toggle-switch--on' : ''}`}
            onClick={() => setSavingsMode((v) => !v)}
            aria-label="절약 모드 전환"
          >
            <span className="toggle-switch__knob" />
          </button>
        </div>
      </div>

      <div className="summary-card__mood">
        {savingsMode ? (
          <span className="summary-card__mood-text">이번 달 쓸 수 있는 돈</span>
        ) : (
          <>
            <span className="summary-card__mood-face">{face}</span>
            <span className="summary-card__mood-text">
              {!hasPreviousData ? (
                '지난달 기록이 없어요'
              ) : diff === 0 ? (
                '지난달과 지출이 같아요'
              ) : (
                <>
                  지난달보다{' '}
                  <span className={`summary-card__diff ${spentMore ? 'text-expense' : 'text-income'}`}>
                    {Math.abs(diff).toLocaleString()}원
                  </span>{' '}
                  {spentMore ? '더' : '덜'} 썼어요
                </>
              )}
            </span>
          </>
        )}
      </div>

      {savingsMode ? (
        budget == null ? (
          <div className="summary-card__budget-setup">
            <input
              type="number"
              placeholder="이번 달 예산을 입력하세요"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
            <button className="action-button" onClick={handleSaveBudget}>
              설정
            </button>
          </div>
        ) : (
          <>
            <div className="summary-card__balance-value summary-card__balance-value--savings tabular-nums">
              {remaining!.toLocaleString()}원
            </div>
            <div className="summary-card__row">
              <div className="summary-card__stat">
                <div className="summary-card__stat-label">예산</div>
                <div className="summary-card__stat-value tabular-nums">{budget.toLocaleString()}</div>
              </div>
              <div className="summary-card__stat">
                <div className="summary-card__stat-label">사용</div>
                <div className="summary-card__stat-value tabular-nums">{totalExpense.toLocaleString()}</div>
              </div>
            </div>
            <button
              className="summary-card__budget-edit"
              onClick={() => {
                setBudgetInput(String(budget));
                setBudget(null);
              }}
            >
              예산 다시 설정하기
            </button>
          </>
        )
      ) : (
        <>
          <div className="summary-card__balance-value tabular-nums">
            {balance >= 0 ? '+' : ''}
            {balance.toLocaleString()}원
          </div>

          <div className="summary-card__row">
            <div className="summary-card__stat summary-card__stat--income">
              <div className="summary-card__stat-label">수입</div>
              <div className="summary-card__stat-value tabular-nums">
                {totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="summary-card__stat summary-card__stat--expense">
              <div className="summary-card__stat-label">지출</div>
              <div className="summary-card__stat-value tabular-nums">
                {totalExpense.toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
