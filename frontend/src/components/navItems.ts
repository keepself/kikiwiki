import { WalletIcon, CalendarIcon, DumbbellIcon, BookmarkIcon, PinIcon, CameraIcon, UserIcon } from './NavIcons';

export interface NavItem {
  path: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '가계부' },
  { path: '/schedule', label: '일정관리' },
  { path: '/workout', label: '운동기록' },
  { path: '/storage', label: '정보 저장소' },
  { path: '/place', label: '플레이스' },
  { path: '/ootd', label: 'OOTD' },
];

export const PAGE_LABELS: Record<string, string> = {
  ...Object.fromEntries(NAV_ITEMS.map((item) => [item.path, item.label])),
  '/mypage': '마이페이지',
};

export const TAB_ICONS: Record<string, () => React.ReactElement> = {
  '/': WalletIcon,
  '/schedule': CalendarIcon,
  '/workout': DumbbellIcon,
  '/storage': BookmarkIcon,
  '/place': PinIcon,
  '/ootd': CameraIcon,
  '/mypage': UserIcon,
};
