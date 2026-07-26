import { useToastStore, type Toast } from '@/store/toastStore';

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const isError = toast.type === 'error';

  return (
    <div
      className={`flex items-center justify-between w-full max-w-sm px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-200 ${
        isError
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? (
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span>{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className={`ml-3 transition-colors ${isError ? 'text-red-400 hover:text-red-600' : 'text-slate-400 hover:text-white'}`}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 w-full max-w-xs px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={remove} />
      ))}
    </div>
  );
}
