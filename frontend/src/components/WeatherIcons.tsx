// 얇은 선 아이콘 대신 구글 날씨 위젯처럼 색이 있는 아이콘으로 표현함

export function SunIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" fill="#FBBF24" opacity="0.18" />
      <circle cx="20" cy="20" r="11" fill="#F7B733" />
      <circle cx="17" cy="17" r="4" fill="#FFD873" opacity="0.7" />
    </svg>
  );
}

export function CloudIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="17" rx="14" ry="10" fill="#B9C6D6" opacity="0.35" />
      <path
        d="M12 27a6 6 0 0 1-1.2-11.9A8 8 0 0 1 26 14.3 6.5 6.5 0 0 1 27.8 27H12Z"
        fill="#9CADC1"
      />
    </svg>
  );
}

export function FogIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="17" rx="14" ry="10" fill="#B9C6D6" opacity="0.3" />
      <rect x="8" y="15" width="24" height="3" rx="1.5" fill="#AAB7C4" />
      <rect x="6" y="21" width="28" height="3" rx="1.5" fill="#AAB7C4" />
      <rect x="10" y="27" width="20" height="3" rx="1.5" fill="#AAB7C4" />
    </svg>
  );
}

export function RainIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="14" rx="13" ry="9" fill="#B9C6D6" opacity="0.3" />
      <path
        d="M12 23a5.5 5.5 0 0 1-1.1-10.9A7.3 7.3 0 0 1 25 11.3 6 6 0 0 1 26.7 23H12Z"
        fill="#8B9CB0"
      />
      <path d="M14 27l-1.5 4M20 27l-1.5 4M26 27l-1.5 4" stroke="#4F9BE0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SnowIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="14" rx="13" ry="9" fill="#C9DCEC" opacity="0.35" />
      <path
        d="M12 23a5.5 5.5 0 0 1-1.1-10.9A7.3 7.3 0 0 1 25 11.3 6 6 0 0 1 26.7 23H12Z"
        fill="#AFC2D6"
      />
      <circle cx="13" cy="29" r="1.6" fill="#DCEBFA" />
      <circle cx="20" cy="31" r="1.6" fill="#DCEBFA" />
      <circle cx="27" cy="29" r="1.6" fill="#DCEBFA" />
    </svg>
  );
}

export function ThunderIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="13" rx="13" ry="9" fill="#8B93A6" opacity="0.3" />
      <path
        d="M12 21a5.5 5.5 0 0 1-1.1-10.9A7.3 7.3 0 0 1 25 9.3 6 6 0 0 1 26.7 21H12Z"
        fill="#6B7686"
      />
      <path d="M21 21l-6 8h5l-2.5 7 8-9h-5l2.5-6Z" fill="#F5C242" />
    </svg>
  );
}
