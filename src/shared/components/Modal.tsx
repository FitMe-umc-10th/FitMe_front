import type { ReactNode } from 'react';
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
  children?: ReactNode;
};

const buttonClassByVariant: Record<NonNullable<ModalButton['variant']>, string> = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-700',
  danger: 'bg-red-500 text-white',
};

export function Modal({ isOpen, onClose, title, description, buttons, children }: ModalProps) {
  if (!isOpen) return null;

  const modalButtons = buttons?.length ? buttons : [{ label: '확인', onClick: onClose }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[342px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-gray-950">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex gap-2">
          {modalButtons.map((button) => {
            const variant = button.variant ?? 'primary';

            return (
              <button
                key={button.label}
                type="button"
                onClick={button.onClick ?? onClose}
                className={`h-12 flex-1 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 ${buttonClassByVariant[variant]}`}
              >
                {button.label}
              </button>
            );
          })}
        </div>
      </section>
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
