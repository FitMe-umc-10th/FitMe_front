import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 Access Token 첨부
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 -> Refresh 재발급 -> 원요청 재시도 (_retry 로 무한루프 방지)
// TODO: 백엔드 Swagger 나오면 refresh 엔드포인트/응답 구조 맞추세요.
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }
        const newToken = await refreshPromise;
        isRefreshing = false;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(original);
        }
        // 재발급 실패(토큰 무효/만료) → 로그아웃해서 로그인으로 유도
        useAuthStore.getState().logout();
      } catch {
        isRefreshing = false;
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);

async function refreshAccessToken(): Promise<string | null> {
  // TODO: 실제 refresh API 로 교체
  // const { data } = await axios.post(`${baseURL}/auth/refresh`, ...);
  // useAuthStore.getState().setAccessToken(data.accessToken);
  // return data.accessToken;
  return null;
}
