interface ErrorStateProps {
  message?: string;
  subMessage?: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  message = '데이터를 불러오지 못했습니다.',
  subMessage = '네트워크를 확인하고 다시 시도해주세요.',
  actionLabel = '다시 시도',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex w-full flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] px-5 py-8 text-center ${className}`}
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[#EEF6FF] text-[#0059FF]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
          <path
            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
      <p className="text-[15px] font-bold text-[#262626]">{message}</p>
      <p className="mt-2 text-[13px] font-medium text-[#8F8F8F]">{subMessage}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 h-10 rounded-[10px] bg-[#0059FF] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#004CE0]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
