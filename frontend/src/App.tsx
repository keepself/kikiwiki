import { useEffect, useState } from 'react';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from './api/client';
import type { Transaction, TransactionInput, TransactionType } from './types/transaction';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { TransactionFilter } from './components/TransactionFilter';
import { MonthSelector } from './components/MonthSelector';
import { SummaryCard } from './components/SummaryCard';
import { CategoryBarChart } from './components/CategoryBarChart';
import './App.css';

const PAGE_SIZE = 10;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthOf(dateString: string): string {
  return dateString.slice(0, 7);
}

function App() {
  const [month, setMonth] = useState(currentMonth());
  const [filterType, setFilterType] = useState<TransactionType | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 합계 카드는 필터/페이지와 무관하게 그 달 전체 데이터를 기준으로 계산 (별도로 관리)
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefreshKey = () => setRefreshKey((k) => k + 1);

  const loadMonthSummary = () => {
    fetchTransactions({ month, page: 0, size: 1000 })
      .then((result) => setMonthTransactions(result.items))
      .catch((err) => setError(err.message));
  };

  // 필터/월 조건이 바뀌면 처음부터 다시 불러옴 (0페이지, 기존 목록 교체)
  const loadFirstPage = () => {
    fetchTransactions({ month, type: filterType ?? undefined, categoryId: filterCategoryId ?? undefined, page: 0, size: PAGE_SIZE })
      .then((result) => {
        setTransactions(result.items);
        setHasMore(result.hasMore);
        setPage(0);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, filterType, filterCategoryId]);

  useEffect(() => {
    loadMonthSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const loadMore = () => {
    const nextPage = page + 1;
    fetchTransactions({ month, type: filterType ?? undefined, categoryId: filterCategoryId ?? undefined, page: nextPage, size: PAGE_SIZE })
      .then((result) => {
        setTransactions((prev) => [...prev, ...result.items]); // 기존 목록 뒤에 이어붙임
        setHasMore(result.hasMore);
        setPage(nextPage);
      })
      .catch((err) => setError(err.message));
  };

  const handleCreate = async (input: TransactionInput) => {
    try {
      await createTransaction(input);

      const targetMonth = monthOf(input.transactionDate);
      if (targetMonth === month) {
        loadFirstPage();
        loadMonthSummary();
        bumpRefreshKey();
      } else {
        setMonth(targetMonth);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async (id: number, input: TransactionInput) => {
    try {
      await updateTransaction(id, input);
      loadFirstPage();
      loadMonthSummary();
      bumpRefreshKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      loadFirstPage();
      loadMonthSummary();
      bumpRefreshKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>kikiwiki 가계부</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="section">
        <MonthSelector month={month} onChange={setMonth} />
        <SummaryCard transactions={monthTransactions} />
      </div>

      <div className="section">
        <h2 className="section-title">카테고리별 지출</h2>
        <CategoryBarChart month={month} refreshKey={refreshKey} />
      </div>

      <div className="section">
        <h2 className="section-title">거래 내역</h2>
        <TransactionFilter
          type={filterType}
          categoryId={filterCategoryId}
          onTypeChange={setFilterType}
          onCategoryChange={setFilterCategoryId}
        />
        <TransactionList
          transactions={transactions}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>

      <div className="section">
        <h2 className="section-title">거래 등록</h2>
        <TransactionForm onSubmit={handleCreate} />
      </div>
    </div>
  );
}

export default App;
