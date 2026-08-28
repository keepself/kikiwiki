// 짧은 절약·소비 관련 격언/속담 모음. 새로고침할 때마다 하나씩 랜덤으로 보여줌
export const MONEY_QUOTES: string[] = [
  '티끌 모아 태산',
  '적게 쓰는 것이 버는 것이다',
  '돈은 도구일 뿐, 목적이 아니다',
  '오늘의 절약이 내일의 여유',
  '작은 지출이 큰 구멍을 만든다',
  '버는 것보다 지키는 게 어렵다',
  '가계부는 미래의 나에게 쓰는 편지',
  '필요와 욕심을 구분하는 습관',
  '소비는 순간, 기록은 오래간다',
  '돈 관리는 습관에서 시작된다',
  '한 달을 알면 일 년이 보인다',
  '아끼는 즐거움도 즐거움이다',
];

export function randomMoneyQuote(): string {
  return MONEY_QUOTES[Math.floor(Math.random() * MONEY_QUOTES.length)];
}
