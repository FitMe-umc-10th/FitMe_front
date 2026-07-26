import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { AnnouncementDTO, AnnouncementDetailDTO } from '@/types/announcements';

export const getAnnouncements = async (): Promise<AnnouncementDTO[]> => {
  const { data } = await axiosInstance.get<ApiResponse<AnnouncementDTO[]>>('/api/v1/announcements');
  return data.result;
};

export const getAnnouncementDetail = async (
  announcementId: number,
): Promise<AnnouncementDetailDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<AnnouncementDetailDTO>>(
    `/api/v1/announcements/${announcementId}`,
  );
  return data.result;
};
