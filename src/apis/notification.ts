import { MOCK_NOTIFICATIONS } from '@/constants/mockData';
import type { NotificationItem } from '@/types/notification';

const sortByCreatedAtDesc = (notifications: NotificationItem[]) =>
  [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getNotifications = async (): Promise<NotificationItem[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return sortByCreatedAtDesc(MOCK_NOTIFICATIONS);
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  await new Promise((r) => setTimeout(r, 150));
  return MOCK_NOTIFICATIONS.filter((notification) => !notification.isRead).length;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await new Promise((r) => setTimeout(r, 200));
  MOCK_NOTIFICATIONS.forEach((notification) => {
    notification.isRead = true;
  });
};
