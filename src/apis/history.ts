import type { ApiResponse } from '@/types/common';
import type { UserApplication, HistoryStatus } from '@/types/history';
import { axiosInstance } from './axiosInstance';

// 이력 전체 가져오기 (각 이력마다 연관 공고 Join)
export const getHistoryList = async (): Promise<UserApplication[]> => {
  const { data } = await axiosInstance.get<ApiResponse<UserApplication[]>>(
    '/api/v1/user-applications',
  );
  return data.result;
};

// 특정 이력 상세 정보 가져오기
export const getHistoryDetail = async (userApplicationsId: number) => {
  const { data } = await axiosInstance.get<ApiResponse<UserApplication>>(
    `/api/v1/user-applications/${userApplicationsId}`,
  );
  return data.result;
};

// 이력 상태 변경 API (이력 상태)
export const updateHistoryStatus = async (userApplicationsId: number, status: HistoryStatus) => {
  const { data } = await axiosInstance.patch<ApiResponse<UserApplication>>(
    `/api/v1/user-applications/${userApplicationsId}`,
    {
      status,
    },
  );
  return data.result;
};

// 이력 메모 업데이트 API
export const updateHistoryMemo = async (userApplicationsId: number, memo: string) => {
  const { data } = await axiosInstance.patch<ApiResponse<UserApplication>>(
    `/api/v1/user-applications/${userApplicationsId}`,
    {
      memo,
    },
  );
  return data.result;
};
