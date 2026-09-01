export interface ScheduleItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  memo: string | null;
  createdAt: string;
}

export interface ScheduleItemInput {
  title: string;
  startDate: string;
  endDate: string;
  memo: string | null;
}
