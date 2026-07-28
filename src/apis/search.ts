import { axiosInstance } from './axiosInstance';
import type { LiveSearchDTO } from '../types/search';

export const getLiveSearchData = async (): Promise<LiveSearchDTO> => {
  const { data } = await axiosInstance.get<LiveSearchDTO>('/api/v1/search/main');
  return data;
};
