import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { SearchPostsResult } from '@/types/explore';

export interface GetSearchPostsParams {
  type?: 'ALL' | 'SCHOLARSHIP' | 'CONTEST' | 'ETC';
  sort?: 'DEADLINE' | 'RECENT';
  category?: 'PM' | 'MARKETING' | 'DESIGN' | 'IT' | 'VIDEO' | 'LANGUAGE' | 'ETC';
  keyword?: string;
  idCursor?: number;
  deadlineCursor?: string;
}

export const getSearchPosts = async (params: GetSearchPostsParams): Promise<SearchPostsResult> => {
  const { data } = await axiosInstance.get<ApiResponse<SearchPostsResult>>('/api/v1/posts/search-post', {
    params: {
      pageSize: 10,
      ...params,
    },
  });
  return data.result;
};

export const deleteSearchKeyword = async (params: { searchId: number }): Promise<string> => {
  const { data } = await axiosInstance.delete<ApiResponse<string>>(
    `/api/v1/posts/search/recent/${params.searchId}`,
  );
  return data.result;
};
