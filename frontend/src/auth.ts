const TOKEN_KEY = 'kikiwiki_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.removeItem('kikiwiki_auth_reload_guard');
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
