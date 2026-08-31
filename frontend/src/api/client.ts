import type { Category, Transaction, TransactionInput, TransactionPage, TransactionType } from '../types/transaction';
import type { WishlistItem, WishlistItemInput, WishlistPurchaseInput } from '../types/wishlist';
import type { RecurringItem, RecurringItemInput } from '../types/recurringItem';
import { getToken, clearToken } from '../auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// App.tsx가 이 이벤트를 구독해서 isLoggedIn을 false로 바꿈 (페이지 새로고침 없이 로그인 화면으로 전환)
export const UNAUTHORIZED_EVENT = 'kikiwiki:unauthorized';

// 모든 API 호출이 거치는 공통 래퍼: 토큰을 자동으로 헤더에 싣고, 401/403이면 로그인 화면으로 보냄
async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    console.error('인증 실패 응답 받음:', url, response.status);
    clearToken();
    // 새로고침 대신 이벤트만 발생시킴 - 여러 요청이 동시에 401/403을 받아도
    // React 상태 전환은 한 번만 일어나므로 새로고침 무한루프 위험이 없음
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new Error('로그인이 필요합니다.');
  }

  return response;
}

export interface LoginResult {
  token: string;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  return response.json();
}

export interface FetchTransactionsParams {
  month: string;
  type?: TransactionType;
  categoryId?: number;
  page?: number;
  size?: number;
}

export async function fetchTransactions(params: FetchTransactionsParams): Promise<TransactionPage> {
  const query = new URLSearchParams();
  query.set('month', params.month);
  if (params.type) query.set('type', params.type);
  if (params.categoryId) query.set('categoryId', String(params.categoryId));
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));

  const response = await authorizedFetch(`${API_BASE_URL}/api/transactions?${query}`);

  if (!response.ok) {
    throw new Error(`거래 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`거래 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateTransaction(id: number, input: TransactionInput): Promise<Transaction> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`거래 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`거래 삭제 실패: ${response.status}`);
  }
}

export async function fetchCategories(type?: TransactionType): Promise<Category[]> {
  const url = type
    ? `${API_BASE_URL}/api/categories?type=${type}`
    : `${API_BASE_URL}/api/categories`;

  const response = await authorizedFetch(url);

  if (!response.ok) {
    throw new Error(`카테고리 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchActiveMonths(year: number): Promise<string[]> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/transactions/active-months?year=${year}`);

  if (!response.ok) {
    throw new Error(`활성 월 조회 실패: ${response.status}`);
  }

  return response.json();
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
}

export async function fetchCategorySummary(month: string, type: TransactionType): Promise<CategorySummary[]> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/transactions/category-summary?month=${month}&type=${type}`);

  if (!response.ok) {
    throw new Error(`카테고리별 요약 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/wishlist`);

  if (!response.ok) {
    throw new Error(`위시리스트 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createWishlistItem(input: WishlistItemInput): Promise<WishlistItem> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`위시리스트 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateWishlistItem(id: number, input: WishlistItemInput): Promise<WishlistItem> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/wishlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`위시리스트 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function purchaseWishlistItem(id: number, input: WishlistPurchaseInput): Promise<WishlistItem> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/wishlist/${id}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`구매완료 처리 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteWishlistItem(id: number): Promise<void> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/wishlist/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`위시리스트 삭제 실패: ${response.status}`);
  }
}

export interface LinkPreview {
  title: string | null;
  imageUrl: string | null;
  price: string | null;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/wishlist/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`링크 정보 가져오기 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchRecurringItems(month: string): Promise<RecurringItem[]> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/recurring-items?month=${month}`);

  if (!response.ok) {
    throw new Error(`고정지출 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createRecurringItem(input: RecurringItemInput): Promise<RecurringItem> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/recurring-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`고정지출 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateRecurringItem(id: number, input: RecurringItemInput): Promise<RecurringItem> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/recurring-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`고정지출 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteRecurringItem(id: number): Promise<void> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/recurring-items/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`고정지출 삭제 실패: ${response.status}`);
  }
}

export async function applyRecurringItem(id: number, month: string): Promise<Transaction> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/recurring-items/${id}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('이미 이번 달에 추가된 항목이에요.');
    }
    throw new Error(`고정지출 추가 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchBudget(): Promise<number | null> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/budget`);

  if (!response.ok) {
    throw new Error(`예산 조회 실패: ${response.status}`);
  }

  const data: { amount: number | null } = await response.json();
  return data.amount;
}

export async function updateBudget(amount: number): Promise<number | null> {
  const response = await authorizedFetch(`${API_BASE_URL}/api/budget`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    throw new Error(`예산 저장 실패: ${response.status}`);
  }

  const data: { amount: number | null } = await response.json();
  return data.amount;
}
