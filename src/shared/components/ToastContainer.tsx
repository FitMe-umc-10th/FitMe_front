import { useToastStore } from '@/store/toastStore';

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 w-full max-w-xs px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-lg text-sm font-medium transition-all duration-300 transform scale-100 hover:scale-[1.02] cursor-pointer animate-fade-in-up ${
            toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-slate-900/95 text-white backdrop-blur-sm'
          }`}
        >
          <span>{toast.message}</span>
          <button className="ml-2 text-white/70 hover:text-white focus:outline-none">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
