export interface RecurringItem {
  id: number;
  name: string;
  amount: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  appliedThisMonth: boolean;
}

export interface RecurringItemInput {
  name: string;
  amount: number;
  categoryId: number;
}
