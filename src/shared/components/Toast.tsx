import { useEffect } from 'react';
import { useToastStore } from '@/store/toastStore';

export function ToastViewport() {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;

    const timerId = window.setTimeout(hideToast, 3000);
    return () => window.clearTimeout(timerId);
  }, [hideToast, toast]);

  if (!toast) return null;

  const typeClass =
    toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white';

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
      <div
        role="status"
        className={`max-w-[342px] rounded-xl px-4 py-3 text-center text-sm font-medium shadow-lg ${typeClass}`}
      >
        {toast.message}
      </div>
    </div>
  );
}
