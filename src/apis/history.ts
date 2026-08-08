import type { ApiResponse } from '@/types/common';
import type {
  UserApplicationListItem,
  HistoryStatus,
  UserApplicationDetail,
  GetHistoryListParams,
} from '@/types/history';
import { axiosInstance } from './axiosInstance';

// 이력 전체 가져오기 (쿼리 파라미터 tab, page, size 지원)
export const getHistoryList = async (
  params?: GetHistoryListParams,
): Promise<UserApplicationListItem[]> => {
  const { data } = await axiosInstance.get<
    ApiResponse<{ userApplications: UserApplicationListItem[] }>
  >('/api/v1/user-applications', {
    params: {
      tab: params?.tab ?? 'IN_PROGRESS',
      page: params?.page ?? 0,
      size: params?.size ?? 15,
    },
  });
  return data.result?.userApplications ?? [];
};

// 이력 생성
export const createHistory = async (postId: number) => {
  const { data } = await axiosInstance.post<ApiResponse<UserApplicationListItem>>(
    '/api/v1/user-applications',
    {
      postId,
    },
  );
  return data.result;
};

// 특정 이력 상세 정보 가져오기
export const getHistoryDetail = async (userApplicationsId: number) => {
  const { data } = await axiosInstance.get<ApiResponse<UserApplicationDetail>>(
    `/api/v1/user-applications/${userApplicationsId}`,
  );
  return data.result;
};

// 이력 상태 변경 API (이력 상태)
export const updateHistoryStatus = async (userApplicationsId: number, status: HistoryStatus) => {
  const { data } = await axiosInstance.patch<ApiResponse<UserApplicationDetail>>(
    `/api/v1/user-applications/${userApplicationsId}/status`,
    {
      status,
    },
  );
  return data.result;
};

// 이력 메모 업데이트 API
export const updateHistoryMemo = async (userApplicationsId: number, memo: string) => {
  const { data } = await axiosInstance.patch<ApiResponse<UserApplicationDetail>>(
    `/api/v1/user-applications/${userApplicationsId}/memo`,
    {
      memo,
    },
  );
  return data.result;
};

// 이력 삭제
export const deleteHistory = async (userApplicationsId: number) => {
  const { data } = await axiosInstance.delete<ApiResponse<{ userApplicationId: number }>>(
    `/api/v1/user-applications/${userApplicationsId}`,
  );
  return data.result;
};
