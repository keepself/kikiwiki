// 카테고리 대신, 등록 순서(id)에 따라 색이 순환되도록 함 - 항목마다 시각적으로만 구분되면 충분
const PALETTE = ['blue', 'green', 'orange'] as const;

export function scheduleColorClass(id: number): string {
  return PALETTE[id % PALETTE.length];
}
