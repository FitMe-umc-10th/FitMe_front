import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { LiveSearchDTO } from '../types/search';

export const getLiveSearchData = async (): Promise<LiveSearchDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<LiveSearchDTO>>('/api/v1/search/main');
  return data.result;
};
