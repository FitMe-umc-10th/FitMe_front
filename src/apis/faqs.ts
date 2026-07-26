import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { faqsDTO } from '@/types/faqs';

export const getFAQs = async (): Promise<faqsDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<faqsDTO>>('/api/v1/faqs');
  return data.result;
};
