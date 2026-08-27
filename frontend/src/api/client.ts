import type { Category, Transaction, TransactionInput, TransactionType } from '../types/transaction';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchTransactions(month?: string): Promise<Transaction[]> {
  const url = month
    ? `${API_BASE_URL}/api/transactions?month=${month}`
    : `${API_BASE_URL}/api/transactions`;

  const response = await fetch(url);

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
