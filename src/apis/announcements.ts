import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { AnnouncementDTO, AnnouncementDetailDTO } from '@/types/announcements';

export const getAnnouncements = async (): Promise<AnnouncementDTO[]> => {
  const { data } = await axiosInstance.get<
    ApiResponse<AnnouncementDTO[] | { announcements?: AnnouncementDTO[]; announcementList?: AnnouncementDTO[] }>
  >('/api/v1/announcements');
  const res = data.result;
  if (Array.isArray(res)) {
    return res;
  }
  if (res && Array.isArray(res.announcements)) {
    return res.announcements;
  }
  if (res && Array.isArray(res.announcementList)) {
    return res.announcementList;
  }
  return [];
};

export const getAnnouncementDetail = async (
  announcementId: number,
): Promise<AnnouncementDetailDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<AnnouncementDetailDTO>>(
    `/api/v1/announcements/${announcementId}`,
  );
  return data.result;
};
