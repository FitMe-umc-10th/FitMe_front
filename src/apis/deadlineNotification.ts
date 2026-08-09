import { ApiResponse } from '@/types/common';
import { axiosInstance } from './axiosInstance';
import type { DeadlineNotificationDTO } from '@/types/deadlineNotification';

export const getDeadlineNotifications = async (size: number = 15): Promise<DeadlineNotificationDTO> => {
  try {
    const { data } = await axiosInstance.get<DeadlineNotificationDTO>(
      '/api/v1/deadline-notifications',
      {
        params: {
          size,
        },
      },
    );
    return data;
  } catch (error) {
    console.warn(
      '[deadlineNotifications] 백엔드 엔드포인트 미구현/오류로 인한 안전 폴백 처리입니다.',
      error,
    );
    return {
      hasNext: false,
      nextCursor: null,
      notifications: [],
    };
  }
};

export const getDeadlineNotificationCount = async (): Promise<number> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<number>>(
      '/api/v1/deadline-notifications/unread-count',
    );
    return data.result ?? 0;
  } catch {
    return 0;
  }
};
