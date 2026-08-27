import { useEffect, useState } from 'react';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from './api/client';
import type { Transaction, TransactionInput } from './types/transaction';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { MonthSelector } from './components/MonthSelector';
import { SummaryCard } from './components/SummaryCard';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// "2026-08-27" 같은 날짜 문자열에서 "2026-08"만 추출
function monthOf(dateString: string): string {
  return dateString.slice(0, 7);
}

function App() {
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = (targetMonth: string) => {
    fetchTransactions(targetMonth)
      .then(setTransactions)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadTransactions(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const handleCreate = async (input: TransactionInput) => {
    try {
      await createTransaction(input);

      const targetMonth = monthOf(input.transactionDate);
      if (targetMonth === month) {
        loadTransactions(month); // 같은 달이면 목록만 새로고침
      } else {
        setMonth(targetMonth); // 다른 달이면 그 달로 이동 (useEffect가 자동으로 목록을 불러옴)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async (id: number, input: TransactionInput) => {
    try {
      await updateTransaction(id, input);
      loadTransactions(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      loadTransactions(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>kikiwiki 가계부</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <MonthSelector month={month} onChange={setMonth} />
      <SummaryCard transactions={transactions} />

      <section style={{ marginBottom: '2rem' }}>
        <h2>거래 내역</h2>
        <TransactionList
          transactions={transactions}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>

      <section>
        <h2>거래 등록</h2>
        <TransactionForm onSubmit={handleCreate} />
      </section>
    </div>
  );
}

export default App;
