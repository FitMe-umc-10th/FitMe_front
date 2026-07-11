export type NotificationType = 'DEADLINE' | 'APPLICATION';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  postingId: number;
  isRead: boolean;
}
