export interface RoutineItem {
  id: number;
  title: string;
  daysOfWeek: number[]; // ISO 요일 값 (1=월요일 ~ 7=일요일)
  memo: string | null;
  createdAt: string;
}

export interface RoutineItemInput {
  title: string;
  daysOfWeek: number[];
  memo: string | null;
}
