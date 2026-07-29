import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isOnboarded: boolean; // 온보딩 완료 여부 (Protected Route 분기용)
  userName: string;
  setAccessToken: (token: string | null) => void;
  setOnboarded: (v: boolean) => void;
  setUserName: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isOnboarded: false,
  userName: '',
  setAccessToken: (token) => set({ accessToken: token }),
  setOnboarded: (v) => set({ isOnboarded: v }),
  setUserName: (name) => set({ userName: name }),
  logout: () => set({ accessToken: null, isOnboarded: false }),
}));
