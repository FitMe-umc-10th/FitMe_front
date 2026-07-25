import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { MyPageDTO, ProfileDetailDTO, ProfileSettingsDTO } from '@/types/profile';
import type { NotificationSettingDTO } from '@/types/notificationSetting';

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

export const getNotificationSettings = async (): Promise<NotificationSettingDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<NotificationSettingDTO>>(
    '/api/v1/mypage/notification-settings',
  );
  return data.result;
};

export const updateNotificationSettings = async (settings: NotificationSettingDTO) => {
  const { data } = await axiosInstance.patch<ApiResponse<NotificationSettingDTO>>(
    '/api/v1/mypage/notification-settings',
    settings,
  );
  return data.result;
};
