import type { ApiResponse } from '@/types/common';
import { axiosInstance } from './axiosInstance';
import type { DeadlineNotificationDTO, UnreadCountResponse } from '@/types/deadlineNotification';

const EMPTY_DEADLINE_NOTIFICATIONS: DeadlineNotificationDTO = {
  hasNext: false,
  nextCursor: null,
  notifications: [],
};

export const getDeadlineNotifications = async (
  size: number = 15,
  cursor?: number,
): Promise<DeadlineNotificationDTO> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<DeadlineNotificationDTO>>(
      '/api/v1/deadline-notifications',
      {
        params: {
          size,
          cursor,
        },
      },
    );
    const result = data?.result ?? (data as unknown as DeadlineNotificationDTO);
    return {
      hasNext: result?.hasNext ?? false,
      nextCursor: result?.nextCursor ?? null,
      notifications: result?.notifications ?? [],
    };
  } catch {
    return EMPTY_DEADLINE_NOTIFICATIONS;
  }
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
