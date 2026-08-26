const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface HealthResponse {
  backend: string;
  database: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`서버 응답 오류: ${response.status}`);
  }

  return response.json();
}