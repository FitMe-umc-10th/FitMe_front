import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { InquiryDTO, InquiryResponseDTO } from '@/types/inquiries';

export const submitInquiry = async (inquiry: InquiryDTO): Promise<boolean> => {
  const { data } = await axiosInstance.post<ApiResponse<InquiryResponseDTO>>(
    '/api/v1/inquiries',
    inquiry,
  );
  return data.isSuccess;
};
