import axios, { AxiosError, AxiosInstance } from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearAccessToken, clearRefreshToken } from '../utils/auth';

function resolveBaseURL(raw?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
  let base = (raw || '').trim();
  if (!base) base = '';
  if (/^https?:\/\//i.test(base)) {
    base = base.replace(/\/+$/, '');
  } else if (/^\/\//.test(base)) {
    const proto = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    base = (proto + base).replace(/\/+$/, '');
  } else if (/^:/.test(base)) {
    const proto = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    base = `${proto}//${host}${base}`.replace(/\/+$/, '');
  } else if (/^[\w.-]+:\d+/.test(base)) {
    base = `http://${base}`.replace(/\/+$/, '');
  } else if (base.startsWith('/')) {
    base = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000') + base.replace(/\/+$/, '');
  } else if (!base) {
    base = origin.replace(/\/+$/, '');
  } else {
    base = base.replace(/\/+$/, '');
  }
  if (!/\/api(\/v\d+)?$/i.test(base)) {
    base = `${base}/api/v1`;
  }
  return base;
}

const baseURL = resolveBaseURL(import.meta.env.VITE_API_URL as string | undefined);

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  } catch {
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data: any = error.response?.data;
    const originalRequest: any = error.config;

    if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/token/refresh/')) {
      const refresh = getRefreshToken();
      if (refresh) {
        if (isRefreshing) {
          const newToken = await new Promise<string | null>((resolve) => pendingQueue.push(resolve));
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          originalRequest._retry = true;
          return api(originalRequest);
        }
        isRefreshing = true;
        originalRequest._retry = true;
        try {
          const rb = resolveBaseURL((import.meta as any).env.VITE_API_URL as string | undefined);
          const refreshClient = axios.create({ baseURL: rb, headers: { 'Content-Type': 'application/json' } });
          const res = await refreshClient.post('/auth/token/refresh/', { refresh });
          const newAccess = (res.data as any)?.access;
          const newRefresh = (res.data as any)?.refresh || null;
          if (newAccess) {
            setAccessToken(newAccess);
            if (newRefresh) setRefreshToken(newRefresh);
            pendingQueue.forEach((fn) => fn(newAccess));
            pendingQueue = [];
            isRefreshing = false;
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch (e) {
          pendingQueue.forEach((fn) => fn(null));
          pendingQueue = [];
          isRefreshing = false;
          clearAccessToken();
          clearRefreshToken();
        }
      }
    }

    const normalized = {
      status,
      message:
        (data && (data.detail || data.message)) ||
        error.message ||
        'Network Error',
      details: data || null,
    };
    return Promise.reject(normalized);
  }
);

export default api;

