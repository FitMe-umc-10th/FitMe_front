import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // refreshToken(HttpOnly 쿠키) 송수신용
});

// 요청마다 Access Token 첨부
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401(또는 code TOKEN403_1) -> Refresh 재발급 -> 원요청 재시도
// single-flight: 동시에 여러 요청이 만료돼도 재발급은 한 번만 실행
// _retry: 재시도한 요청이 또 실패해도 무한 루프에 빠지지 않게 차단
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const code = (error.response?.data as { code?: string } | undefined)?.code;

    // 백엔드는 AT 만료를 401 또는 code=TOKEN403_1로 알려줌
    const shouldReissue = status === 401 || code === 'TOKEN403_1';

    if (shouldReissue && original && !original._retry) {
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
          return axiosInstance(original); // 새 토큰으로 원요청 재시도
        }
        // 재발급 실패(RT 만료·무효) → 로그아웃해서 로그인으로 유도
        useAuthStore.getState().logout();
      } catch {
        isRefreshing = false;
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);

// RT(HttpOnly 쿠키)로 새 AT 발급 — POST /api/auth/reissue
// 인터셉터 재진입을 막기 위해 axiosInstance가 아닌 순수 axios 사용
async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/reissue`,
      null, // 바디 없음 (스웨거: No parameters)
      { withCredentials: true }, // refreshToken 쿠키 자동 전송
    );
    const newToken: string = data.result.accessToken;
    useAuthStore.getState().setAccessToken(newToken);
    return newToken;
  } catch {
    return null; // 재발급 실패 → 위에서 logout 처리됨
  }
}
