import { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../api/client';
import type { AppNotification } from '../types/notification';

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8a5 5 0 0 1 10 0c0 3.5 1.2 4.8 1.5 5.3H3.5C3.8 12.8 5 11.5 5 8Z" />
      <path d="M8.2 16a1.8 1.8 0 0 0 3.6 0" />
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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = () => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setOpen((v) => {
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
    <div className="notification-bell">
      <button className="notification-bell__trigger" onClick={handleToggle} aria-label="알림">
        <BellIcon />
        {unreadCount > 0 && <span className="notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="notification-bell__dropdown">
            <div className="notification-bell__header">
              알림
              {unreadCount > 0 && (
                <button className="notification-bell__mark-all" onClick={handleMarkAllRead}>
                  모두 읽음
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="notification-bell__empty">알림이 없어요.</div>
            ) : (
              <div className="notification-bell__list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    className={`notification-bell__item ${n.read ? '' : 'notification-bell__item--unread'}`}
                    onClick={() => handleItemClick(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleItemClick(n);
                    }}
                  >
                    <span className="notification-bell__message">{n.message}</span>
                    <span className="notification-bell__time">{formatNotificationTime(n.createdAt)}</span>
                    <button
                      className="notification-bell__delete"
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
  );
}
