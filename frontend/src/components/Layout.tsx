import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

interface Props {
  onLogout: () => void;
}

export function Layout({ onLogout }: Props) {
  return (
    <div className="layout">
      <TopBar onLogout={onLogout} />
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}
