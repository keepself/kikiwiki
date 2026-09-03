import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { WindowFrame, type OpenTab, PAGE_LABELS } from './WindowFrame';
import { DashboardPage } from '../pages/DashboardPage';
import { SchedulePage } from '../pages/SchedulePage';
import { WorkoutPage } from '../pages/WorkoutPage';

interface Props {
  onLogout: () => void;
}

export function Layout({ onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => [
    { path: location.pathname, label: PAGE_LABELS[location.pathname] ?? location.pathname },
  ]);

  // 상단바에서 누르면 그 화면 탭을 열고(이미 열려있으면 중복 없이) 그 탭으로 이동
  const openTab = (path: string) => {
    setOpenTabs((prev) => {
      if (prev.some((tab) => tab.path === path)) return prev;
      return [...prev, { path, label: PAGE_LABELS[path] ?? path }];
    });
    navigate(path);
  };

  // 탭 닫기 - 마지막 탭까지 닫으면 화면(탭+새창)이 전부 사라지고 상단바만 남음
  const closeTab = (path: string) => {
    const remaining = openTabs.filter((tab) => tab.path !== path);
    setOpenTabs(remaining);
    if (path === location.pathname && remaining.length > 0) {
      navigate(remaining[remaining.length - 1].path);
    }
  };

  return (
    <div className="layout">
      <TopBar onLogout={onLogout} onOpenTab={openTab} />
      <main className="layout__content">
        <WindowFrame openTabs={openTabs} onTabClick={navigate} onCloseTab={closeTab}>
          {/* 둘 다 항상 마운트해두고 안 보이는 쪽만 숨김 - 탭을 오가도 스크롤 위치/입력 상태가
              그대로 유지됨 (Outlet으로 매번 갈아끼우면 탭 전환마다 리마운트되어 상태가 날아감) */}
          <div style={{ display: location.pathname === '/' ? 'block' : 'none' }}>
            <DashboardPage />
          </div>
          <div style={{ display: location.pathname === '/schedule' ? 'block' : 'none' }}>
            <SchedulePage />
          </div>
          <div style={{ display: location.pathname === '/workout' ? 'block' : 'none' }}>
            <WorkoutPage />
          </div>
        </WindowFrame>
      </main>
    </div>
  );
}
