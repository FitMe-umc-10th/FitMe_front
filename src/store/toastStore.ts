import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: 'success' | 'error') => void;
  remove: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error') => void; // PR 7 호환용
  success: (message: string) => void; // PR 7 호환용
  error: (message: string) => void;   // PR 7 호환용
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    
    // 3초 뒤 자동 삭제
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  showToast: (message, type = 'success') => get().show(message, type),
  success: (message) => get().show(message, 'success'),
  error: (message) => get().show(message, 'error'),
}));