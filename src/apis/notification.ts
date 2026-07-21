import { MOCK_NOTIFICATIONS } from '@/constants/mockData';
import type { Notification, NotificationItem } from '@/types/notification';

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

const mapNotificationToBoth = (item: NotificationItem): Notification & NotificationItem => {
  return {
    ...item,
    category: item.type === 'DEADLINE' ? '마감 임박' : '지원 관리',
    description: item.message,
  };
};

export const getNotifications = async (): Promise<any[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return sortByCreatedAtDesc(applyMockReadNotifications()).map(mapNotificationToBoth);
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

export const markAsRead = async (id: number): Promise<Notification> => {
  await new Promise((r) => setTimeout(r, 100));
  const notifications = applyMockReadNotifications();
  const target = notifications.find((n) => n.id === id);
  if (target) {
    target.isRead = true;
    const readNotifications = readMockReadNotifications();
    readNotifications[id] = true;
    window.localStorage.setItem(MOCK_READ_NOTIFICATIONS_KEY, JSON.stringify(readNotifications));
    return mapNotificationToBoth(target);
  }
  throw new Error('Notification not found');
};

export const markAllAsRead = async (): Promise<Notification[]> => {
  await new Promise((r) => setTimeout(r, 150));
  const notifications = applyMockReadNotifications();
  notifications.forEach((notification) => {
    notification.isRead = true;
  });
  writeAllMockReadNotifications();
  return sortByCreatedAtDesc(notifications).map(mapNotificationToBoth);
};
