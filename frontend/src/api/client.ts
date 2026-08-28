import type { Category, Transaction, TransactionInput, TransactionPage, TransactionType } from '../types/transaction';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const response = await fetch(`${API_BASE_URL}/api/transactions?${query}`);

  if (!response.ok) {
    throw new Error(`거래 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
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
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`카테고리 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchActiveMonths(year: number): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/transactions/active-months?year=${year}`);

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
  const response = await fetch(`${API_BASE_URL}/api/transactions/category-summary?month=${month}&type=${type}`);

  if (!response.ok) {
    throw new Error(`카테고리별 요약 조회 실패: ${response.status}`);
  }

  return response.json();
}
