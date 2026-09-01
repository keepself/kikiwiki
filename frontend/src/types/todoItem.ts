export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TodoItem {
  id: number;
  title: string;
  memo: string | null;
  linkedScheduleItemId: number | null;
  status: TodoStatus;
  createdAt: string;
  deletedAt: string | null;
}

export interface TodoItemInput {
  title: string;
  memo: string | null;
  linkedScheduleItemId?: number;
}
