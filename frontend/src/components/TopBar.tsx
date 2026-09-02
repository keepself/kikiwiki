import { NotificationBell } from './NotificationBell';

interface Props {
  onLogout: () => void;
  onOpenTab: (path: string) => void;
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="15" height="10" rx="2" />
      <path d="M2.5 8.5h15" />
      <circle cx="14" cy="12" r="1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="15" height="13.5" rx="2.2" />
      <path d="M2.5 8h15M6.3 2.5v3M13.7 2.5v3" />
      <circle cx="10" cy="12.5" r="1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H4.5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1H8" />
      <path d="M17 10H8" />
      <path d="m13 6.5 3.5 3.5-3.5 3.5" />
    </svg>
  );
}

export function TopBar({ onLogout, onOpenTab }: Props) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <span className="topbar__logo">kikiwiki</span>

        {/* 아래 탭 목록이랑 별개로, "이 화면을 탭으로 열기"용 트리거일 뿐이라 현재 보고 있는
            탭이 뭔지와 상관없이 항상 같은 모양 - 활성 표시는 탭 쪽에서만 함(독립적으로 동작).
            탭을 닫은 뒤 같은 경로를 다시 열 때도 동작해야 해서 NavLink 대신 직접 버튼으로 처리 */}
        <nav className="topbar__nav">
          <button type="button" className="topbar__item" onClick={() => onOpenTab('/')}>
            <span className="topbar__icon">
              <WalletIcon />
            </span>
            가계부
          </button>

          <button type="button" className="topbar__item" onClick={() => onOpenTab('/schedule')}>
            <span className="topbar__icon">
              <CalendarIcon />
            </span>
            일정관리
          </button>
        </nav>

        <div className="topbar__actions">
          <NotificationBell />
          <button className="topbar__logout" onClick={onLogout} title="로그아웃" aria-label="로그아웃">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
