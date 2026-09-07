const BASE = '/api';
const TOKEN_KEY = 'organic2home_token';

let unauthorizedHandler = null;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const auth = token === undefined ? getToken() : token;
  if (auth) headers.Authorization = `Bearer ${auth}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error('Unable to reach Organic2Home. Check your connection and try again.');
    error.code = 'NETWORK_ERROR';
    error.status = 0;
    throw error;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    if (res.status === 401) unauthorizedHandler?.();
    const error = new Error(json?.error?.message || 'Request failed');
    error.code = json?.error?.code;
    error.status = res.status;
    throw error;
  }
  return json.data;
}
