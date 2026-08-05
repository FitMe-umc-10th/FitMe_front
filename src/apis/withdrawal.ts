import { axiosInstance } from './axiosInstance';

export const requestWithdrawal = async (): Promise<void> => {
  await axiosInstance.delete('/api/auth');
};

