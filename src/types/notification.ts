export interface Notification {
  id: number;
  category: string;     // 예: '마감 임박', '지원 관리'
  title: string;
  description: string;
  createdAt: string;    // 예: '2시간 전', '어제', '3일 전'
  isRead: boolean;      // 읽음 상태
  postingId: number;    // 연결된 관련 공고 ID
}
