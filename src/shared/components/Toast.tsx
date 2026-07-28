import { useToastStore, type Toast as ToastType } from '@/store/toastStore';

interface ToastItemProps {
  toast: ToastType;
  onClose?: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastItemProps) {
  return (
    <div
      onClick={() => onClose?.(toast.id)}
      className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-lg text-sm font-medium transition-all duration-300 transform scale-100 hover:scale-[1.02] cursor-pointer animate-fade-in-up ${
        toast.type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-slate-900/95 text-white backdrop-blur-sm'
      }`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.(toast.id);
        }}
        className="ml-2 text-white/70 hover:text-white focus:outline-none"
      >
        &times;
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 w-full max-w-xs px-4">
      {toasts.map((item) => (
        <Toast key={item.id} toast={item} onClose={remove} />
      ))}
    </div>
  );
}

export default ToastViewport;
