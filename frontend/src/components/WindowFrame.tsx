import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export interface OpenTab {
  path: string;
  label: string;
}

export const PAGE_LABELS: Record<string, string> = {
  '/': '가계부',
  '/schedule': '일정관리',
  '/workout': '운동기록',
};

interface Props {
  openTabs: OpenTab[];
  onTabClick: (path: string) => void;
  onCloseTab: (path: string) => void;
  children: ReactNode;
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

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8v4M17 8v4" />
      <rect x="1" y="7" width="2.5" height="6" rx="0.6" />
      <rect x="16.5" y="7" width="2.5" height="6" rx="0.6" />
      <path d="M6 10h8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8.5" width="14" height="8" rx="1.5" />
      <path d="M6 8.5V6a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

const TAB_ICONS: Record<string, () => React.ReactElement> = {
  '/': WalletIcon,
  '/schedule': CalendarIcon,
  '/workout': DumbbellIcon,
};

// 열린 탭이 하나도 없으면(전부 닫음) 새 창 자체를 렌더링하지 않음 - 상단바만 남고 나머지는 사라짐.
// 신호등 점 옆에 탭이 붙어있는, 실제 브라우저 창 구조(창 컨트롤 + 탭 → 주소창 → 본문)를 흉내냄
export function WindowFrame({ openTabs, onTabClick, onCloseTab, children }: Props) {
  const location = useLocation();
  const windowRef = useRef<HTMLDivElement>(null);

  // 탭이 바뀔 때마다 팝인 애니메이션만 다시 재생 - key로 리마운트하면 안에 있는 실제 페이지까지
  // 같이 리마운트되어 스크롤 위치 등 상태가 날아가므로, 리플로우로 CSS 애니메이션만 재시작함
  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;
    el.classList.remove('window--pop');
    void el.offsetWidth;
    el.classList.add('window--pop');
  }, [location.pathname]);

  // 탭(경로)별 스크롤 위치를 계속 기록해뒀다가, 탭을 다시 열 때 그 위치로 되돌려줌.
  // 두 탭 다 항상 마운트돼 있고 문서 스크롤 하나를 공유하는 구조라, 그냥 두면 탭을 바꿔도
  // window.scrollY가 그대로 남아있거나(엉뚱한 위치) 짧은 탭으로 갈 때 0으로 잘려버림
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[location.pathname] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.current[location.pathname] ?? 0);
  }, [location.pathname]);

  if (openTabs.length === 0) {
    return null;
  }

  const label = PAGE_LABELS[location.pathname] ?? 'kikiwiki';

  return (
    <div className="window window--pop" ref={windowRef}>
      <div className="window__tabrow">
        <div className="window__dots">
          <span className="window__dot window__dot--r" />
          <span className="window__dot window__dot--y" />
          <span className="window__dot window__dot--g" />
        </div>
        <div className="window__tabs">
          {openTabs.map((tab) => {
            const Icon = TAB_ICONS[tab.path] ?? WalletIcon;
            const isActive = tab.path === location.pathname;
            return (
              <button
                key={tab.path}
                className={`window__tab ${isActive ? 'window__tab--active' : ''}`}
                onClick={() => onTabClick(tab.path)}
              >
                <span className="window__tab-icon">
                  <Icon />
                </span>
                <span className="window__tab-label">{tab.label}</span>
                <span
                  className="window__tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.path);
                  }}
                  aria-label="탭 닫기"
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="window__chrome">
        <div className="window__addressbar">
          <LockIcon />
          kikiwiki.app/{label}
        </div>
      </div>
      <div className="window__body">{children}</div>
    </div>
  );
}
