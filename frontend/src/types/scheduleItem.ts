export interface ScheduleItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  memo: string | null;
  routineId: number | null;
  createdAt: string;
}

export interface ScheduleItemInput {
  title: string;
  startDate: string;
  endDate: string;
  memo: string | null;
}
