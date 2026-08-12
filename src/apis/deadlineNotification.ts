import type { ApiResponse } from '@/types/common';
import { axiosInstance } from './axiosInstance';
import type { DeadlineNotificationDTO, UnreadCountResponse } from '@/types/deadlineNotification';

export const deadlineNotificationQueryKeys = {
  all: ['deadlineNotifications'] as const,
  list: ['deadlineNotifications', 'list'] as const,
  unreadCount: ['deadlineNotifications', 'unreadCount'] as const,
};

export const getDeadlineNotifications = async (
  size: number = 15,
  cursor?: number,
): Promise<DeadlineNotificationDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<DeadlineNotificationDTO>>(
    '/api/v1/deadline-notifications',
    {
      params: {
        size,
        cursor,
      },
    },
  );

  return data.result;
};

export const getDeadlineNotificationCount = async (): Promise<number> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<UnreadCountResponse | number>>(
      '/api/v1/deadline-notifications/unread-count',
    );
    if (data?.result && typeof data.result === 'object' && 'unreadCount' in data.result) {
      return (data.result as UnreadCountResponse).unreadCount ?? 0;
    }
    if (typeof data?.result === 'number') {
      return data.result;
    }
    return 0;
  } catch {
    return 0;
  }
};
