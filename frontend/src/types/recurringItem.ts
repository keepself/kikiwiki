export interface RecurringItem {
  id: number;
  name: string;
  amount: number;
  dayOfMonth: number | null;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  appliedThisMonth: boolean;
}

export interface RecurringItemInput {
  name: string;
  amount: number;
  dayOfMonth: number | null;
}
