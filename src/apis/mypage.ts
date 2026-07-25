// import type { Notice, FAQ } from '@/types/profile';

import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { MyPageDTO, ProfileDetailDTO, ProfileSettingsDTO } from '@/types/profile';

export const getUserProfile = async (): Promise<MyPageDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<MyPageDTO>>('/api/v1/mypage');
  return data.result;
};

export const updateUserProfile = async (profile: ProfileDetailDTO) => {
  const { data } = await axiosInstance.patch<ApiResponse<ProfileDetailDTO>>(
    '/api/v1/mypage/profile',
    profile,
  );
  return data.result;
};

export const getUserProfileDetail = async (): Promise<ProfileSettingsDTO> => {
  const { data } =
    await axiosInstance.get<ApiResponse<ProfileSettingsDTO>>('/api/v1/mypage/profile');
  return data.result;
};

// export const getNotices = async (): Promise<Notice[]> => {
//   await new Promise((r) => setTimeout(r, 200));
//   return MOCK_NOTICES;
// };

// export const getFAQs = async (): Promise<FAQ[]> => {
//   await new Promise((r) => setTimeout(r, 200));
//   return MOCK_FAQS;
// };

// export const submitInquiry = async (inquiry: {
//   title: string;
//   content: string;
// }): Promise<boolean> => {
//   await new Promise((r) => setTimeout(r, 500));
//   console.log('[Mock API] 1:1 문의 접수 완료:', inquiry);
//   return true;
// };
