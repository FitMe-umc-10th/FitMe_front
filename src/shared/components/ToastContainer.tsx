import { useToastStore } from '@/store/toastStore';
import { Toast } from './Toast';

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 w-full max-w-xs px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={remove} />
      ))}
    </div>
  );
}
