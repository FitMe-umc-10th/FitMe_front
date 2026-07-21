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

export interface Notification {
  id: number;
  category?: string;     // 예: '마감 임박', '지원 관리'
  type?: NotificationType;
  title: string;
  description?: string;  // 예: '마감일이 3일 남았습니다...'
  message?: string;
  createdAt: string;
  isRead: boolean;
  postingId: number;
}
