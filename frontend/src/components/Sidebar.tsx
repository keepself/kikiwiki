import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS, TAB_ICONS } from './navItems';
import { UserIcon } from './NavIcons';
import { WeatherWidget } from './WeatherWidget';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../api/client';
import type { Profile } from '../types/profile';
import type { AppNotification } from '../types/notification';

interface Props {
  profile: Profile;
  onOpenTab: (path: string) => void;
  onLogout: () => void;
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 4.5 6.5 10l6 5.5" />
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

function formatNotificationTime(createdAt: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const date = createdAt.slice(0, 10);
  if (date === today) {
    return `오늘 ${createdAt.slice(11, 16)}`;
  }
  return date.slice(5).replace('-', '/');
}

// 좁은 화면에서는 처음부터 아이콘만 보이는 접힌 상태로 시작함 (리사이즈 리스너 없이 마운트 시 한 번만 판단)
function getInitialCollapsed() {
  return typeof window !== 'undefined' && window.innerWidth < 780;
}

export function Sidebar({ profile, onOpenTab, onLogout }: Props) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMyPage = location.pathname === '/mypage';

  // 알림 - 뱃지 숫자는 팝오버를 열지 않아도 보여야 해서 마운트 시 바로 불러오고,
  // 프로필(사진) 클릭해서 열 때마다 최신 상태로 다시 불러옴
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = () => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleToggleMenu = () => {
    setMenuOpen((v) => {
      if (!v) loadNotifications();
      return !v;
    });
  };

  const handleItemClick = async (notification: AppNotification) => {
    if (notification.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(notification.id);
    } catch {
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      loadNotifications();
    }
  };

  const handleDelete = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      loadNotifications();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <button
        type="button"
        className="sidebar__collapse-btn"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        <CollapseIcon />
      </button>

      <div className="row-menu-wrap sidebar__profile-wrap">
        <button
          type="button"
          className={`sidebar__profile ${isMyPage ? 'sidebar__profile--current' : ''}`}
          onClick={handleToggleMenu}
        >
          <span className="sidebar__profile-avatar-wrap">
            <span className="sidebar__profile-photo">
              {profile.profileImageDataUrl ? (
                <img src={profile.profileImageDataUrl} alt="" />
              ) : (
                <UserIcon />
              )}
            </span>
            {unreadCount > 0 && (
              <span className="sidebar__profile-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </span>
          <span className="sidebar__profile-name">{profile.username || '마이페이지'}</span>
        </button>

        {menuOpen && (
          <>
            <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="sidebar__notif-card">
              <div className="sidebar__notif-header">
                알림
                {unreadCount > 0 && (
                  <button type="button" className="sidebar__notif-mark-all" onClick={handleMarkAllRead}>
                    모두 읽음
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="sidebar__notif-empty">알림이 없어요.</div>
              ) : (
                <div className="sidebar__notif-list">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      className={`sidebar__notif-item ${n.read ? '' : 'sidebar__notif-item--unread'}`}
                      onClick={() => handleItemClick(n)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleItemClick(n);
                      }}
                    >
                      <span className="sidebar__notif-message">{n.message}</span>
                      <span className="sidebar__notif-time">{formatNotificationTime(n.createdAt)}</span>
                      <button
                        type="button"
                        className="sidebar__notif-delete"
                        aria-label="삭제"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 마이페이지/로그아웃은 팝오버가 아니라 사이드바 자체에 항상 보이는 작은 한 줄 링크로 둠 */}
      <div className="sidebar__account-links">
        <button type="button" className="sidebar__account-link" onClick={() => onOpenTab('/mypage')}>
          <UserIcon />
          <span className="sidebar__account-link-label">마이페이지</span>
        </button>
        <span className="sidebar__account-link-divider" />
        <button type="button" className="sidebar__account-link" onClick={onLogout}>
          <LogoutIcon />
          <span className="sidebar__account-link-label">로그아웃</span>
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = TAB_ICONS[item.path];
          const isCurrent = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              className={`sidebar__item ${isCurrent ? 'sidebar__item--current' : ''}`}
              onClick={() => onOpenTab(item.path)}
            >
              <span className="sidebar__item-icon">
                <Icon />
              </span>
              <span className="sidebar__item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__spacer" />

      <WeatherWidget />
    </aside>
  );
}
