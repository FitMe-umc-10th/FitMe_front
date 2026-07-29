import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  isOnboarded: boolean;
  userName: string;
  setAccessToken: (token: string | null) => void;
  setOnboarded: (v: boolean) => void;
  setUserName: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isOnboarded: false,
      userName: '',
      setAccessToken: (token) => set({ accessToken: token }),
      setOnboarded: (v) => set({ isOnboarded: v }),
      setUserName: (name) => set({ userName: name }),
      logout: () => set({ accessToken: null, isOnboarded: false, userName: '' }),
    }),
    { name: 'auth-storage' }, // localStorage에 저장될 키 이름
  ),
);
