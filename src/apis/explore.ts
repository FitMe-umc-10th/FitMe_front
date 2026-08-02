import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/common';
import type { SearchPostsResult } from '@/types/explore';

export interface GetSearchPostsParams {
  type?: 'ALL' | 'SCHOLARSHIP' | 'CONTEST';
  sort?: 'DEADLINE' | 'RECENT';
  category?: 'MARKETING' | 'PM' | 'DESIGN' | 'DEV' | 'LANGUAGE' | 'ETC';
  keyword?: string;
  idCursor?: number;
  deadlineCursor?: string;
}

export const getSearchPosts = async (params: GetSearchPostsParams): Promise<SearchPostsResult> => {
  const { data } = await axiosInstance.get<ApiResponse<SearchPostsResult>>('/api/v1/posts', {
    params,
  });
  return data.result;
};
