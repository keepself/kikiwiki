export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  description: string | null;
  transactionDate: string; // 'YYYY-MM-DD' 형식
  createdAt: string;
}

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  categoryId: number;
  description: string;
  transactionDate: string;
}

export interface TransactionPage {
  items: Transaction[];
  hasMore: boolean;
  totalCount: number;
}
