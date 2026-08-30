import { useEffect, useState } from 'react';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchWishlist,
  createWishlistItem,
  deleteWishlistItem,
  UNAUTHORIZED_EVENT,
} from './api/client';
import type { Transaction, TransactionInput, TransactionType } from './types/transaction';
import type { WishlistItem, WishlistItemInput } from './types/wishlist';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { TransactionFilter } from './components/TransactionFilter';
import { MonthSelector } from './components/MonthSelector';
import { SummaryCard } from './components/SummaryCard';
import { CategoryBarChart } from './components/CategoryBarChart';
import { WishlistForm } from './components/WishlistForm';
import { WishlistList } from './components/WishlistList';
import { LoginPage } from './components/LoginPage';
import { getToken, clearToken } from './auth';
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
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
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

  // 어떤 API 요청이든 401/403을 받으면(토큰 만료 등) 새로고침 없이 로그인 화면으로 전환
  useEffect(() => {
    const handleUnauthorized = () => setIsLoggedIn(false);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

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

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
  };

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const loadWishlist = () => {
    fetchWishlist()
      .then(setWishlist)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleWishlistCreate = async (input: WishlistItemInput) => {
    try {
      await createWishlistItem(input);
      loadWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : '위시리스트 등록 중 오류가 발생했습니다.');
    }
  };

  const handleWishlistDelete = async (id: number) => {
    try {
      await deleteWishlistItem(id);
      loadWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : '위시리스트 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>kikiwiki 가계부</h1>
        <button className="text-button" onClick={handleLogout}>로그아웃</button>
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

      <div className="section">
        <h2 className="section-title">위시리스트</h2>
        <WishlistList items={wishlist} onDelete={handleWishlistDelete} />
        <WishlistForm onSubmit={handleWishlistCreate} />
      </div>
    </div>
  );
}

export default App;
