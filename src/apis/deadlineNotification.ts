import { axiosInstance } from './axiosInstance';
import type { DeadlineNotificationDTO } from '@/types/deadlineNotification';

export const getDeadlineNotifications = async (): Promise<DeadlineNotificationDTO> => {
  const response = await axiosInstance.get<DeadlineNotificationDTO>(
    '/api/v1/deadline-notifications',
  );
  return response.data;
};
