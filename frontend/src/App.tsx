import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UNAUTHORIZED_EVENT } from './api/client';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { SchedulePage } from './pages/SchedulePage';
import { getToken, clearToken } from './auth';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  // 어떤 API 요청이든 401/403을 받으면(토큰 만료 등) 새로고침 없이 로그인 화면으로 전환
  useEffect(() => {
    const handleUnauthorized = () => setIsLoggedIn(false);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
