import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UNAUTHORIZED_EVENT } from './api/client';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { getToken, clearToken } from './auth';
import { getTimeTheme } from './timeTheme';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  // 어떤 API 요청이든 401/403을 받으면(토큰 만료 등) 새로고침 없이 로그인 화면으로 전환
  useEffect(() => {
    const handleUnauthorized = () => setIsLoggedIn(false);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // 배경을 현재 시간대(5단계)에 맞게 바꿈 - 탭을 오래 켜두면 시간대가 바뀔 수 있어서 주기적으로 다시 확인
  useEffect(() => {
    const applyTimeTheme = () => {
      document.documentElement.dataset.timeTheme = getTimeTheme();
    };
    applyTimeTheme();
    const interval = setInterval(applyTimeTheme, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
        {/* Layout은 부모 라우트라 한 번만 마운트됨. 실제 화면(가계부/일정관리)은
            Outlet으로 경로마다 갈아끼우지 않고 Layout이 직접 둘 다 마운트해둔 채
            보이기/숨기기만 함 - 그래야 탭을 오가도 스크롤 위치/상태가 유지됨.
            아래 자식 라우트는 URL 매칭 용도일 뿐, element는 Layout이 무시함 */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/" element={null} />
          <Route path="/schedule" element={null} />
          <Route path="/workout" element={null} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
