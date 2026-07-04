import { create } from 'zustand';

type ToastType = 'error' | 'success';

type Toast = {
  message: string;
  type: ToastType;
};

type ToastStore = {
  toast: Toast | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
  success: (message) => set({ toast: { message, type: 'success' } }),
  error: (message) => set({ toast: { message, type: 'error' } }),
}));
