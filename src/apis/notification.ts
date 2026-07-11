import { MOCK_NOTIFICATIONS } from '@/constants/mockData';
import type { NotificationItem } from '@/types/notification';

const MOCK_READ_NOTIFICATIONS_KEY = 'fitme:mockReadNotifications';

type MockReadNotifications = Record<number, boolean>;

const sortByCreatedAtDesc = (notifications: NotificationItem[]) =>
  [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const readMockReadNotifications = (): MockReadNotifications => {
  try {
    const readNotifications = window.localStorage.getItem(MOCK_READ_NOTIFICATIONS_KEY);
    if (!readNotifications) return {};

    return JSON.parse(readNotifications) as MockReadNotifications;
  } catch {
    return {};
  }
};

const writeAllMockReadNotifications = () => {
  const readNotifications = MOCK_NOTIFICATIONS.reduce<MockReadNotifications>((acc, notification) => {
    acc[notification.id] = true;
    return acc;
  }, {});

  window.localStorage.setItem(MOCK_READ_NOTIFICATIONS_KEY, JSON.stringify(readNotifications));
};

const applyMockReadNotifications = () => {
  const readNotifications = readMockReadNotifications();

  MOCK_NOTIFICATIONS.forEach((notification) => {
    if (readNotifications[notification.id]) {
      notification.isRead = true;
    }
  });

  return MOCK_NOTIFICATIONS;
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return sortByCreatedAtDesc(applyMockReadNotifications());
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  await new Promise((r) => setTimeout(r, 150));
  return applyMockReadNotifications().filter((notification) => !notification.isRead).length;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await new Promise((r) => setTimeout(r, 200));
  MOCK_NOTIFICATIONS.forEach((notification) => {
    notification.isRead = true;
  });
  writeAllMockReadNotifications();
};
