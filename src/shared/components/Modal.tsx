import { useEffect } from 'react';

type ModalButton = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  buttons?: ModalButton[];
  children?: React.ReactNode;
};

const buttonClassByVariant: Record<NonNullable<ModalButton['variant']>, string> = {
  primary: 'bg-[#4A90E2] text-white',
  secondary: 'bg-[#F0F0F0] text-[#808080]',
  danger: 'bg-red-500 text-white',
};

export function Modal({ isOpen, onClose, title, description, buttons, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalButtons = buttons ?? [{ label: '확인', onClick: onClose, variant: 'primary' }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="flex h-[182px] w-full max-w-[328px] flex-col rounded-[18px] bg-white px-[18px] pb-5 pt-[38px] text-center shadow-xl"
      >
        <h2 id="modal-title" className="text-[15px] font-extrabold leading-[21px] text-[#1E1E1E]">
          {title}
        </h2>
        {description && <p className="mt-[7px] whitespace-pre-line text-[11px] font-medium leading-[17px] text-[#8C8C8C]">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-auto flex justify-center gap-2">
          {modalButtons.map((button) => {
            const variant = button.variant ?? 'primary';

            return (
              <button
                key={button.label}
                type="button"
                onClick={button.onClick ?? onClose}
                className={`h-[44px] w-[141px] rounded-[7.28px] text-[13px] font-extrabold transition-opacity hover:opacity-90 ${buttonClassByVariant[variant]}`}
              >
                {button.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
