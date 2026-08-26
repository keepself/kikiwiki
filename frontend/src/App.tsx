import { useEffect, useState } from 'react';
import { fetchHealth, type HealthResponse } from './api/client';

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>kikiwiki</h1>

      {error && <p style={{ color: 'red' }}>연결 실패: {error}</p>}

      {!error && !health && <p>연결 확인 중....</p>}

      {health && (
        <p>
          백엔드 연결됨: <strong>{health.backend}</strong> · DB 연결됨:{' '}
          <strong>{health.database}</strong>
        </p>
      )}
    </div>
  );
}

export default App;