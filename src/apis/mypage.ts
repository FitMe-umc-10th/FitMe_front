import { MOCK_USER_PROFILE, MOCK_NOTICES, MOCK_FAQS } from '@/constants/mockData';
import type { UserProfile, Notice, FAQ } from '@/types/mypage';

// 화면 전환 간에 수정 사항이 초기화되지 않고 유지될 수 있도록 메모리(로컬 변수)에 관리합니다.
let currentProfile: UserProfile = { ...MOCK_USER_PROFILE };

export const getProfile = async (): Promise<UserProfile> => {
  await new Promise((r) => setTimeout(r, 300)); // 300ms 네트워크 지연 시뮬레이션
  return currentProfile;
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  await new Promise((r) => setTimeout(r, 500)); // 500ms 네트워크 지연 시뮬레이션

  currentProfile = {
    ...currentProfile,
    ...profile,
    activitySummary: profile.activitySummary
      ? { ...currentProfile.activitySummary, ...profile.activitySummary }
      : currentProfile.activitySummary,
    notificationSettings: profile.notificationSettings
      ? { ...currentProfile.notificationSettings, ...profile.notificationSettings }
      : currentProfile.notificationSettings,
  };

  return currentProfile;
};

export const getNotices = async (): Promise<Notice[]> => {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_NOTICES;
};

export const getFAQs = async (): Promise<FAQ[]> => {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_FAQS;
};

export const submitInquiry = async (inquiry: { title: string; content: string }): Promise<boolean> => {
  await new Promise((r) => setTimeout(r, 500));
  console.log('[Mock API] 1:1 문의 접수 완료:', inquiry);
  return true;
};
