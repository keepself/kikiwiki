export type TimeTheme = 'dawn' | 'morning' | 'midday' | 'evening' | 'night';

// 5단계로 나눈 시간대 - 현재 시각(로컬 시계)만 보고 판단, 외부 데이터 없음
export function getTimeTheme(hour: number = new Date().getHours()): TimeTheme {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'midday';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}
