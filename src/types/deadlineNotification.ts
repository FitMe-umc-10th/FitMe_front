export interface NotificationDTO {
  notificationId: number;
  type: string;
  categoryPrefix: string;
  title: string;
  message: string;
  createdAt: string;
  displayTime: string;
  isRead: boolean;
  postId: number;
}

export interface DeadlineNotificationDTO {
  hasNext: boolean;
  nextCursor: number | null;
  notifications: NotificationDTO[];
}
