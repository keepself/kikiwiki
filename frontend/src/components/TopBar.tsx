import { NavLink } from 'react-router-dom';

interface Props {
  onLogout: () => void;
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

export function TopBar({ onLogout }: Props) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <span className="topbar__logo">kikiwiki</span>

        <nav className="topbar__nav">
          <NavLink to="/" end className={({ isActive }) => `topbar__item ${isActive ? 'topbar__item--active' : ''}`}>
            <span className="topbar__icon">
              <WalletIcon />
            </span>
            가계부
          </NavLink>

          <NavLink to="/schedule" className={({ isActive }) => `topbar__item ${isActive ? 'topbar__item--active' : ''}`}>
            <span className="topbar__icon">
              <CalendarIcon />
            </span>
            일정관리
          </NavLink>
        </nav>

        <button className="topbar__logout" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
