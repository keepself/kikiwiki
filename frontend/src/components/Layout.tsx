import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { WindowFrame, type OpenTab } from './WindowFrame';
import { PAGE_LABELS } from './navItems';
import { fetchProfile } from '../api/client';
import type { Profile } from '../types/profile';
import { DashboardPage } from '../pages/DashboardPage';
import { SchedulePage } from '../pages/SchedulePage';
import { WorkoutPage } from '../pages/WorkoutPage';
import { StoragePage } from '../pages/StoragePage';
import { PlacePage } from '../pages/PlacePage';
import { OotdPage } from '../pages/OotdPage';
import { MyPage } from '../pages/MyPage';

interface Props {
  onLogout: () => void;
}

export function Layout({ onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => [
    { path: location.pathname, label: PAGE_LABELS[location.pathname] ?? location.pathname },
  ]);

  // 사이드바(아바타+이름)와 마이페이지가 같은 프로필을 보여줘야 해서 여기서 한 번만 불러와 공유함 -
  // 각자 따로 불러오면 마이페이지에서 사진을 바꿔도 사이드바에는 반영이 안 됨
  const [profile, setProfile] = useState<Profile>({ username: '', heightCm: null, profileImageDataUrl: null });

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

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

  // 탭을 드래그해서 다른 탭 위에 놓으면, 그 탭이 있던 자리로 순서를 옮김 (예: 맨 앞으로 끌어오기)
  const reorderTab = (draggedPath: string, targetPath: string) => {
    setOpenTabs((prev) => {
      const draggedIndex = prev.findIndex((tab) => tab.path === draggedPath);
      const targetIndex = prev.findIndex((tab) => tab.path === targetPath);
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prev;
      const next = [...prev];
      const [draggedTab] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, draggedTab);
      return next;
    });
  };

  return (
    <div className="layout">
      <div className="app-shell">
        <Sidebar profile={profile} onOpenTab={openTab} onLogout={onLogout} />
        <main className="main-pane">
          <WindowFrame openTabs={openTabs} onTabClick={navigate} onCloseTab={closeTab} onReorderTab={reorderTab}>
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
            <div style={{ display: location.pathname === '/storage' ? 'block' : 'none' }}>
              <StoragePage />
            </div>
            <div style={{ display: location.pathname === '/place' ? 'block' : 'none' }}>
              <PlacePage />
            </div>
            <div style={{ display: location.pathname === '/ootd' ? 'block' : 'none' }}>
              <OotdPage />
            </div>
            <div style={{ display: location.pathname === '/mypage' ? 'block' : 'none' }}>
              <MyPage profile={profile} onProfileChange={setProfile} />
            </div>
          </WindowFrame>
        </main>
      </div>
    </div>
  );
}
