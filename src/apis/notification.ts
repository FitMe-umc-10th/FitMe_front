import type { Notification } from '@/types/notification';

// 화면 전환 간에 수정 사항이 초기화되지 않고 유지될 수 있도록 메모리(로컬 변수)에 관리합니다.
let currentNotifications: Notification[] = [
  {
    id: 1,
    category: '마감 임박',
    title: '대기업 브랜드 마케팅 공모전',
    description: '마감일이 3일 남았습니다. 잊지 말고 지원하세요!',
    createdAt: '2시간 전',
    isRead: false,
    postingId: 2,
  },
  {
    id: 2,
    category: '지원 관리',
    title: '삼성재단 청년 장학금',
    description: '홈페이지에서 지원을 마치셨나요? 상태를 변경해주세요.',
    createdAt: '어제',
    isRead: true,
    postingId: 1,
  },
  {
    id: 3,
    category: '마감 임박',
    title: '청년 사회혁신 챌린지',
    description: '오늘이 마감일입니다! 마지막까지 화이팅!',
    createdAt: '3일 전',
    isRead: true,
    postingId: 3,
  },
];

export const getNotifications = async (): Promise<Notification[]> => {
  await new Promise((r) => setTimeout(r, 200)); // 200ms 네트워크 지연 시뮬레이션
  return [...currentNotifications];
};

export const markAsRead = async (id: number): Promise<Notification> => {
  await new Promise((r) => setTimeout(r, 100)); // 100ms 네트워크 지연 시뮬레이션
  const index = currentNotifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    currentNotifications[index] = {
      ...currentNotifications[index],
      isRead: true,
    };
    return currentNotifications[index];
  }
  throw new Error('Notification not found');
};

export const markAllAsRead = async (): Promise<Notification[]> => {
  await new Promise((r) => setTimeout(r, 150));
  currentNotifications = currentNotifications.map((n) => ({
    ...n,
    isRead: true,
  }));
  return [...currentNotifications];
};
