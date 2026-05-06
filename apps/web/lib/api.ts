const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', body });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}

async function apiRequest<T>(
  path: string,
  options: { method: string; body?: unknown },
  retryOnUnauthorized = true,
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: options.method,
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });

    if (res.status === 401 && typeof window !== 'undefined') {
      if (retryOnUnauthorized && (await refreshAccessToken())) {
        return apiRequest<T>(path, options, false);
      }
      clearSession();
      throw new Error('Session expired. Please login again.');
    }

    if (!res.ok) throw new Error(await getErrorMessage(res));
    if (res.status === 204) return {} as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : {}) as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach API at ${API_URL}. Start the backend with npm run dev:api.`);
    }
    throw error;
  }
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('nhc_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function hasSession() {
  return typeof window !== 'undefined' && Boolean(window.localStorage.getItem('nhc_access_token'));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('nhc_access_token');
  window.localStorage.removeItem('nhc_refresh_token');
  window.location.href = '/login';
}

async function refreshAccessToken() {
  const refreshToken = window.localStorage.getItem('nhc_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const result = (await res.json()) as { accessToken: string; refreshToken: string };
    window.localStorage.setItem('nhc_access_token', result.accessToken);
    window.localStorage.setItem('nhc_refresh_token', result.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function getErrorMessage(res: Response) {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? text;
  } catch {
    return text || `${res.status} ${res.statusText}`;
  }
}
