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
  primary: 'bg-[#0059FF] text-white',
  secondary: 'bg-[#F2F2F2] text-[#595959]',
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
  const isHistoryStatusError = title === '상태 변경에 실패했어요';
  const isHistoryNotice = title === '꼭 이력을 관리 해주세요!';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex w-[323px] flex-col overflow-hidden rounded-2xl bg-white ${isHistoryNotice ? 'h-[221px]' : 'h-[199px]'}`}
      >
        <div className={`flex w-full flex-col items-center px-8 pb-6 pt-8 text-center ${isHistoryNotice ? 'h-[163px]' : 'h-[141px]'} gap-4`}>
          <h2 id="modal-title" className="w-full text-[18px] font-semibold leading-[140%] text-[#1E1E1E]">
            {title}
          </h2>
          {description && (
            <p className="w-full whitespace-pre-line text-center text-[16px] font-normal leading-[140%] tracking-[-0.02em] text-[#8C8C8C]">
              {description}
            </p>
          )}
          {children && <div>{children}</div>}
        </div>
        <div className="flex h-[58px] w-full items-start justify-center gap-2 px-3 pb-4">
          {modalButtons.map((button) => {
            const variant = button.variant ?? 'primary';
            const isSingleButton = modalButtons.length === 1;

            return (
              <button
                key={button.label}
                type="button"
                onClick={button.onClick ?? onClose}
                className={`flex h-[42px] items-center justify-center rounded-lg text-[16px] font-semibold leading-[140%] transition-opacity hover:opacity-90 ${
                  isSingleButton ? 'w-[295px]' : 'w-36'
                } ${buttonClassByVariant[variant]}`}
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
