import { useEffect, useRef, useState } from 'react';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchWishlist,
  createWishlistItem,
  updateWishlistItem,
  purchaseWishlistItem,
  deleteWishlistItem,
  fetchRecurringItems,
  createRecurringItem,
  updateRecurringItem,
  deleteRecurringItem,
  applyRecurringItem,
} from '../api/client';
import type { Transaction, TransactionInput, TransactionType } from '../types/transaction';
import type { WishlistItem, WishlistItemInput, WishlistPurchaseInput } from '../types/wishlist';
import type { RecurringItem, RecurringItemInput } from '../types/recurringItem';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { TransactionFilter } from '../components/TransactionFilter';
import { MonthSelector } from '../components/MonthSelector';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryBarChart } from '../components/CategoryBarChart';
import { SpendingCalendar } from '../components/SpendingCalendar';
import { WishlistForm } from '../components/WishlistForm';
import { WishlistList } from '../components/WishlistList';
import { WishlistPurchaseForm } from '../components/WishlistPurchaseForm';
import { RecurringItemForm } from '../components/RecurringItemForm';
import { RecurringItemList } from '../components/RecurringItemList';
import { Modal } from '../components/Modal';
import { TriangleLeftIcon, TriangleRightIcon } from '../components/TriangleIcons';

const PAGE_SIZE = 6;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthOf(dateString: string): string {
  return dateString.slice(0, 7);
}

function previousMonthOf(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 2, 1); // month는 1-based라 -1, 전달로 한 번 더 -1
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [filterType, setFilterType] = useState<TransactionType | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 날짜 칩으로 특정 날짜를 골랐을 때: 더보기 목록 대신 그 날짜 거래만 바로 보여줌 (페이지네이션 우회)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // 합계 카드는 필터/페이지와 무관하게 그 달 전체 데이터를 기준으로 계산 (날짜 칩 목록도 여기서 뽑음)
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [previousMonthTransactions, setPreviousMonthTransactions] = useState<Transaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefreshKey = () => setRefreshKey((k) => k + 1);

  const loadMonthSummary = () => {
    fetchTransactions({ month, page: 0, size: 1000 })
      .then((result) => setMonthTransactions(result.items))
      .catch((err) => setError(err.message));

    fetchTransactions({ month: previousMonthOf(month), page: 0, size: 1000 })
      .then((result) => setPreviousMonthTransactions(result.items))
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
    setSelectedDay(null); // 월/필터가 바뀌면 날짜 선택도 초기화
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

  // 검색어가 있으면 더보기로 불러온 페이지 안에서만 찾을 수 없으므로(서버가 검색을 지원 안 함),
  // 날짜 선택 때처럼 그 달 전체 데이터에서 클라이언트로 걸러서 보여줌
  const isBrowsingFullMonth = selectedDay !== null || searchQuery.trim() !== '';
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // 구분/카테고리/검색 필터에 맞는지 (날짜 조건은 별도) - 날짜 드롭다운 목록과 실제 표시 목록이
  // 항상 같은 기준을 쓰도록 공통 함수로 뺌
  const matchesFilters = (t: Transaction) =>
    (!filterType || t.type === filterType) &&
    (!filterCategoryId || t.categoryId === filterCategoryId) &&
    (!normalizedQuery || (t.description ?? '').toLowerCase().includes(normalizedQuery));

  // 날짜 드롭다운 목록: 지금 필터(구분/카테고리/검색)에 맞는 거래가 있는 날짜만, 최신순
  const availableDays = Array.from(
    new Set(monthTransactions.filter(matchesFilters).map((t) => t.transactionDate))
  ).sort((a, b) => b.localeCompare(a));

  const displayedTransactions = isBrowsingFullMonth
    ? monthTransactions.filter((t) => (!selectedDay || t.transactionDate === selectedDay) && matchesFilters(t))
    : transactions;

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
      loadRecurringItems();
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
      loadRecurringItems();
      bumpRefreshKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const [showTxForm, setShowTxForm] = useState(false);
  const [showWishForm, setShowWishForm] = useState(false);
  const [editingWishlistItem, setEditingWishlistItem] = useState<WishlistItem | null>(null);
  const [purchasingWishlistItem, setPurchasingWishlistItem] = useState<WishlistItem | null>(null);
  const [showWishlistDetail, setShowWishlistDetail] = useState(false);
  const [showRecurringDetail, setShowRecurringDetail] = useState(false);

  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingRecurringItem, setEditingRecurringItem] = useState<RecurringItem | null>(null);

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

  const handleWishlistUpdate = async (input: WishlistItemInput) => {
    if (!editingWishlistItem) return;
    try {
      await updateWishlistItem(editingWishlistItem.id, input);
      loadWishlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : '위시리스트 수정 중 오류가 발생했습니다.');
    }
  };

  const handleWishlistPurchase = async (input: WishlistPurchaseInput) => {
    if (!purchasingWishlistItem) return;
    try {
      await purchaseWishlistItem(purchasingWishlistItem.id, input);
      loadWishlist();
      loadMonthSummary(); // 가계부에 새 지출이 생겼으니 요약도 갱신
      if (monthOf(new Date().toISOString()) === month) {
        loadFirstPage();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '구매완료 처리 중 오류가 발생했습니다.');
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

  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const recurringRequestRef = useRef(0);

  // 월을 빠르게 옮기면 여러 요청이 겹쳐서 나갈 수 있는데, 늦게 도착한 응답이
  // 항상 이기면 이전 달 데이터가 최신 화면을 덮어쓸 수 있음 - 가장 마지막에
  // "보낸" 요청의 응답만 반영되도록 순번으로 막음
  const loadRecurringItems = () => {
    const requestId = ++recurringRequestRef.current;
    fetchRecurringItems(month)
      .then((items) => {
        if (recurringRequestRef.current === requestId) {
          setRecurringItems(items);
        }
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadRecurringItems();
  }, [month]);

  const handleRecurringCreate = async (input: RecurringItemInput) => {
    try {
      await createRecurringItem(input);
      loadRecurringItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '고정지출 등록 중 오류가 발생했습니다.');
    }
  };

  const handleRecurringUpdate = async (input: RecurringItemInput) => {
    if (!editingRecurringItem) return;
    try {
      await updateRecurringItem(editingRecurringItem.id, input);
      loadRecurringItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '고정지출 수정 중 오류가 발생했습니다.');
    }
  };

  const handleRecurringDelete = async (id: number) => {
    try {
      await deleteRecurringItem(id);
      loadRecurringItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '고정지출 해지 중 오류가 발생했습니다.');
    }
  };

  const handleRecurringApply = async (item: RecurringItem) => {
    try {
      // 지금 보고 있는 달을 그대로 서버에 넘기고, 실제 날짜(결제일 반영)는 서버가 계산함
      await applyRecurringItem(item.id, month);
      loadRecurringItems();
      loadFirstPage();
      loadMonthSummary();
      bumpRefreshKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : '고정지출 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      {showWishlistDetail ? (
        <div className="card section">
          <div className="card-header-row">
            <button className="text-button" onClick={() => setShowWishlistDetail(false)}>
              ‹ 뒤로
            </button>
            <h2 className="section-title">위시리스트</h2>
            <button className="add-button" onClick={() => setShowWishForm(true)}>
              + 추가
            </button>
          </div>
          <WishlistList
            items={wishlist}
            onDelete={handleWishlistDelete}
            onEdit={setEditingWishlistItem}
            onPurchase={setPurchasingWishlistItem}
          />
        </div>
      ) : showRecurringDetail ? (
        <div className="card section">
          <div className="card-header-row">
            <button className="text-button" onClick={() => setShowRecurringDetail(false)}>
              ‹ 뒤로
            </button>
            <h2 className="section-title">고정지출/구독</h2>
            <button className="add-button" onClick={() => setShowRecurringForm(true)}>
              + 추가
            </button>
          </div>
          {recurringItems.length > 0 && (
            <div className="recurring-summary">
              이번 달 고정지출 합계
              <span className="recurring-summary__amount tabular-nums">
                {recurringItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원
              </span>
            </div>
          )}
          <RecurringItemList
            items={recurringItems}
            onApply={handleRecurringApply}
            onEdit={setEditingRecurringItem}
            onDelete={handleRecurringDelete}
          />
        </div>
      ) : (
      <div className="top-row">
        <div className="top-row__left">
          <div className="card section">
            <MonthSelector month={month} onChange={setMonth} />
            <SummaryCard
              month={month}
              transactions={monthTransactions}
              previousMonthTransactions={previousMonthTransactions}
            />
          </div>

          <div className="section">
            <CategoryBarChart month={month} refreshKey={refreshKey} />
          </div>

          <div className="card section">
            <div className="spending-calendar__header">
              <button className="icon-button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="이전 달">
                <TriangleLeftIcon />
              </button>
              <h2 className="section-title">{Number(month.slice(5, 7))}月</h2>
              <button className="icon-button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="다음 달">
                <TriangleRightIcon />
              </button>
            </div>
            <SpendingCalendar month={month} transactions={monthTransactions} />
          </div>
        </div>

        <div className="top-row__right">
          <div className="card section">
            <div className="filter-bar-row">
              <TransactionFilter
                type={filterType}
                categoryId={filterCategoryId}
                searchQuery={searchQuery}
                availableDays={availableDays}
                selectedDay={selectedDay}
                onTypeChange={setFilterType}
                onCategoryChange={setFilterCategoryId}
                onSearchChange={setSearchQuery}
                onSelectDay={setSelectedDay}
              />
              <button className="add-button" onClick={() => setShowTxForm(true)}>
                + 등록
              </button>
            </div>
            <TransactionList
              transactions={displayedTransactions}
              hasMore={hasMore}
              showPagination={!isBrowsingFullMonth}
              page={page}
              onLoadMore={loadMore}
              onCollapse={loadFirstPage}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>

          <div className="card section">
            <div className="card-header-row">
              <h2 className="section-title">고정지출/구독</h2>
              <button className="add-button" onClick={() => setShowRecurringForm(true)}>
                + 추가
              </button>
            </div>
            {recurringItems.length > 0 && (
              <div className="recurring-summary">
                이번 달 고정지출 합계
                <span className="recurring-summary__amount tabular-nums">
                  {recurringItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원
                </span>
              </div>
            )}
            <RecurringItemList
              items={recurringItems}
              onApply={handleRecurringApply}
              onEdit={setEditingRecurringItem}
              onDelete={handleRecurringDelete}
              limit={6}
              onViewAll={() => setShowRecurringDetail(true)}
            />
          </div>

          <div className="card section">
            <div className="card-header-row">
              <h2 className="section-title">위시리스트</h2>
              <button className="add-button" onClick={() => setShowWishForm(true)}>
                + 추가
              </button>
            </div>
            <WishlistList
              items={wishlist}
              onDelete={handleWishlistDelete}
              onEdit={setEditingWishlistItem}
              onPurchase={setPurchasingWishlistItem}
              limit={6}
              onViewAll={() => setShowWishlistDetail(true)}
            />
          </div>
        </div>
      </div>
      )}

      {showTxForm && (
        <Modal title="거래 등록" onClose={() => setShowTxForm(false)}>
          <TransactionForm
            onSubmit={async (input) => {
              await handleCreate(input);
              setShowTxForm(false);
            }}
          />
        </Modal>
      )}

      {showWishForm && (
        <Modal title="위시리스트 추가" onClose={() => setShowWishForm(false)}>
          <WishlistForm
            onSubmit={async (input) => {
              await handleWishlistCreate(input);
              setShowWishForm(false);
            }}
          />
        </Modal>
      )}

      {editingWishlistItem && (
        <Modal title="위시리스트 수정" onClose={() => setEditingWishlistItem(null)}>
          <WishlistForm
            submitLabel="수정하기"
            initialValues={{
              name: editingWishlistItem.name,
              price: editingWishlistItem.price,
              imageUrl: editingWishlistItem.imageUrl,
              productUrl: editingWishlistItem.productUrl,
              priority: editingWishlistItem.priority,
            }}
            onSubmit={async (input) => {
              await handleWishlistUpdate(input);
              setEditingWishlistItem(null);
            }}
          />
        </Modal>
      )}

      {purchasingWishlistItem && (
        <Modal title="구매완료 처리" onClose={() => setPurchasingWishlistItem(null)}>
          <WishlistPurchaseForm
            item={purchasingWishlistItem}
            onSubmit={async (input) => {
              await handleWishlistPurchase(input);
              setPurchasingWishlistItem(null);
            }}
          />
        </Modal>
      )}

      {showRecurringForm && (
        <Modal title="고정지출/구독 추가" onClose={() => setShowRecurringForm(false)}>
          <RecurringItemForm
            onSubmit={async (input) => {
              await handleRecurringCreate(input);
              setShowRecurringForm(false);
            }}
          />
        </Modal>
      )}

      {editingRecurringItem && (
        <Modal title="고정지출/구독 수정" onClose={() => setEditingRecurringItem(null)}>
          <RecurringItemForm
            submitLabel="수정하기"
            initialValues={{
              name: editingRecurringItem.name,
              amount: editingRecurringItem.amount,
              dayOfMonth: editingRecurringItem.dayOfMonth,
            }}
            onSubmit={async (input) => {
              await handleRecurringUpdate(input);
              setEditingRecurringItem(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
