import type { ReactNode } from 'react';
import { create } from 'zustand';

type ModalButton = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

type ModalState = {
  isOpen: boolean;
  title: string;
  description?: string;
  buttons?: ModalButton[];
  children?: ReactNode;
};

type ModalStore = {
  modal: ModalState;
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
};

const initialModal: ModalState = {
  isOpen: false,
  title: '',
};

export const useModalStore = create<ModalStore>((set) => ({
  modal: initialModal,
  openModal: (modal) => set({ modal: { ...modal, isOpen: true } }),
  closeModal: () => set({ modal: initialModal }),
}));
