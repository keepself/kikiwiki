// 정보저장소/플레이스 리스트의 타입 표시용 - 이모지 대신 쓰는 단색 아이콘
export function LinkTypeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 11.5 11.5 8.5" />
      <path d="M9.5 6 11 4.5a2.5 2.5 0 0 1 3.5 3.5L13 9.5" />
      <path d="M10.5 14 9 15.5A2.5 2.5 0 0 1 5.5 12L7 10.5" />
    </svg>
  );
}

export function NoteTypeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 3.5h11v13h-11z" />
      <path d="M7 7.5h6M7 10.5h6M7 13.5h3.5" />
    </svg>
  );
}

export function PinTypeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5c-3 0-5.5 2.3-5.5 5.5 0 3.9 5.5 9.5 5.5 9.5s5.5-5.6 5.5-9.5c0-3.2-2.5-5.5-5.5-5.5Z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}

export function CheckTypeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7.5" />
      <path d="m6.8 10 2.2 2.2 4.2-4.4" />
    </svg>
  );
}
