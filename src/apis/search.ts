import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { LiveSearchDTO, SearchResultsDTO } from '../types/search';

export const getLiveSearchData = async (): Promise<LiveSearchDTO> => {
  const { data } = await axiosInstance.get<ApiResponse<LiveSearchDTO>>('/api/v1/posts/search-main');
  return data.result;
};

// 공고 검색
export const getSearchPosts = async (
  type?: string,
  category?: string,
  sort?: string,
  keyword?: string,
  idCursor?: number,
  deadlineCursor?: number,
  pageSize: number = 10,
) => {
  const { data } = await axiosInstance.get<ApiResponse<SearchResultsDTO>>(
    '/api/v1/posts/search-post',
    {
      params: {
        type,
        category,
        sort,
        keyword,
        idCursor,
        deadlineCursor,
        pageSize,
      },
    },
  );
  return data.result;
};

// 최근 검색어 삭제
export const deleteSearchKeyword = async (searchId: number) => {
  const { data } = await axiosInstance.delete<ApiResponse<string>>(
    `/api/v1/posts/search/recent/${searchId}`,
  );
  return data.result;
};
