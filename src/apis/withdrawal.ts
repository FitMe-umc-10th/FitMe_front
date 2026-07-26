import { axiosInstance } from './axiosInstance';

export const requestWithdrawal = async (): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/users/me`);
  } catch (error) {
    throw error;
  }
};
