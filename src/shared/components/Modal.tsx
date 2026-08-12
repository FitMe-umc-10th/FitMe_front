import { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';

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
  secondary: 'bg-[#F0F0F0] text-[#666666]',
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
  const isApplyCompleteModal = title === '지원을 완료하셨나요?';
  const isHistoryStatusError = title === '상태 변경에 실패했어요';

  if (isHistoryStatusError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="flex h-[169px] w-[323px] flex-col overflow-hidden rounded-2xl bg-white">
          <div className="flex h-[111px] flex-col items-center gap-2 px-8 pb-6 pt-8 text-center">
            <h2 id="modal-title" className="w-full text-[18px] font-semibold leading-[140%] text-[#1E1E1E]">{title}</h2>
            <p className="w-full text-[16px] font-normal leading-[140%] tracking-[-0.02em] text-[#8C8C8C]">{description}</p>
          </div>
          <div className="flex h-[58px] items-start justify-center px-3 pb-4">
            <button type="button" onClick={modalButtons[0]?.onClick ?? onClose} className="flex h-[42px] w-[295px] items-center justify-center rounded-lg bg-[#0059FF] text-[16px] font-semibold leading-[140%] text-white">
              {modalButtons[0]?.label ?? '확인'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="flex h-[182px] w-full max-w-[328px] flex-col rounded-[18px] bg-white px-[18px] pb-5 pt-[34px] text-center shadow-xl"
      >
        <h2 id="modal-title" className="text-[16.3725px] font-bold leading-5 text-[#333333] [font-family:Inter]">
          {title}
        </h2>
        {description && (
          <p
            className={`mt-[11px] whitespace-pre-line font-normal text-[#666666] [font-family:Inter] ${
              isApplyCompleteModal
                ? 'mx-auto w-full text-center text-[11px] leading-[13px]'
                : 'text-center text-[12.7342px] leading-[15px]'
            }`}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-auto flex justify-center gap-[9px]">
          {modalButtons.map((button) => {
            const variant = button.variant ?? 'primary';

            return (
              <button
                key={button.label}
                type="button"
                onClick={button.onClick ?? onClose}
                className={`h-[44px] w-[141px] rounded-[7.28px] text-[13.6438px] font-bold leading-[17px] transition-opacity [font-family:Inter] hover:opacity-90 ${buttonClassByVariant[variant]}`}
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

export function GlobalModal() {
  const modal = useModalStore((state) => state.modal);
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={closeModal}
      title={modal.title}
      description={modal.description}
      buttons={modal.buttons}
    >
      {modal.children}
    </Modal>
  );
}
