import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

export function Header({ title, showBack = false, onBack, rightSlot }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {showBack && (
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={handleBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
              <path
                d="M15 18L9 12L15 6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        )}
        {title && <h1 className="truncate text-lg font-semibold text-gray-950">{title}</h1>}
      </div>
      {rightSlot && <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>}
    </header>
  );
}
