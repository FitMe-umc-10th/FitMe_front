import axios from 'axios';
import type {
  GetClosingSoonPostingsParams,
  GetHomePostingListParams,
  GetRecentViewedPostingsParams,
  GetSavedPostingsParams,
  HomePostingFeed,
  Posting,
  PostingType,
} from '@/types/posting';
import { axiosInstance } from '@/apis/axiosInstance';
import {
  type ApiClosingSoonPostingsResponse,
  type ApiPostingApplication,
  type ApiPostingDetail,
  type ApiPopularPostingsResponse,
  type ApiRecentViewedPostingsResponse,
  type ApiSavedPostMutationPayload,
  type ApiSavedPostingsPayload,
  type PostingApplicationResult,
  getSavedIdFromPayload,
  mapApiPostingApplication,
  mapApiPostingDetailToPosting,
  mapApiPostingList,
  mapApiSavedPostingList,
  mapApiSavedPostingToPosting,
  normalizeSavedPostingsPayload,
  type ApiSavedPosting,
} from '@/apis/postingMapper';
import type { ApiResponse } from '@/types/common';

export type { PostingApplicationResult, PostingApplicationStatus } from '@/apis/postingMapper';

const DEFAULT_HOME_POPULAR_SIZE = 8;
const DEFAULT_HOME_RECENT_VIEWED_SIZE = 10;
const DEFAULT_HOME_CLOSING_SOON_SIZE = 5;

export interface ToggleSaveResult {
  isSaved: boolean;
  savedId?: number;
}

const unwrapApiData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if ('result' in record) return record.result as T;
    if ('data' in record) return record.data as T;
    if ('content' in record) return record.content as T;
  }

  return payload as T;
};

const findSavedIdByPostingId = async (postingId: number) => {
  const { data } = await axiosInstance.get<ApiResponse<ApiSavedPostingsPayload> | ApiSavedPostingsPayload>(
    '/api/v1/saved-posts',
    {
      params: {
        category: 'ALL',
        sort: 'DEADLINE',
        size: 100,
      },
    },
  );
  const savedPostings = normalizeSavedPostingsPayload(unwrapApiData<ApiSavedPostingsPayload>(data));
  const savedPosting = savedPostings.find((posting) => posting.postId === postingId || posting.id === postingId);

  return savedPosting?.savedId;
};

const getPostingDetailByType = async (postingId: number, type: PostingType): Promise<Posting> => {
  const endpoint =
    type === 'SCHOLARSHIP'
      ? `/api/v1/posts/scholarship/${postingId}`
      : `/api/v1/posts/contests/${postingId}`;
  const { data } = await axiosInstance.get(endpoint);

  return mapApiPostingDetailToPosting(unwrapApiData<ApiPostingDetail>(data), type);
};

const isNotFoundError = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404;

export const getPopularPostings = async ({
  cursor,
  size = DEFAULT_HOME_POPULAR_SIZE,
}: GetHomePostingListParams = {}): Promise<Posting[]> => {
  const { data } = await axiosInstance.get('/api/v1/posts/popular', {
    params: {
      cursor,
      size,
    },
  });
  const result = unwrapApiData<ApiPopularPostingsResponse>(data);

  return mapApiPostingList(result.posts ?? result.popularPosts ?? []);
};

export const getRecentViewedPostings = async ({
  page = 0,
  size = DEFAULT_HOME_RECENT_VIEWED_SIZE,
}: GetRecentViewedPostingsParams = {}): Promise<Posting[]> => {
  const { data } = await axiosInstance.get('/api/v1/posts/recent-views', {
    params: {
      page,
      size,
    },
  });
  const result = unwrapApiData<ApiRecentViewedPostingsResponse>(data);

  return mapApiPostingList(result.posts ?? []);
};

export const getClosingSoonPostings = async ({
  type,
  sort = 'FIT',
  size = DEFAULT_HOME_CLOSING_SOON_SIZE,
}: GetClosingSoonPostingsParams): Promise<Posting[]> => {
  const { data } = await axiosInstance.get('/api/v1/posts/closing-soon', {
    params: {
      postType: type === 'ALL' ? undefined : type,
      sort,
      size,
    },
  });
  const result = unwrapApiData<ApiClosingSoonPostingsResponse>(data);

  return mapApiPostingList(result ?? []);
};

export const getHomePostingFeed = async (): Promise<HomePostingFeed> => {
  const [popularResult, recentViewedResult, scholarshipDeadlineResult, contestDeadlineResult] =
    await Promise.allSettled([
      getPopularPostings({ size: DEFAULT_HOME_POPULAR_SIZE }),
      getRecentViewedPostings({ page: 0, size: DEFAULT_HOME_RECENT_VIEWED_SIZE }),
      getClosingSoonPostings({
        type: 'SCHOLARSHIP',
        size: DEFAULT_HOME_CLOSING_SOON_SIZE,
      }),
      getClosingSoonPostings({
        type: 'CONTEST',
        size: DEFAULT_HOME_CLOSING_SOON_SIZE,
      }),
    ]);

  const results = [
    popularResult,
    recentViewedResult,
    scholarshipDeadlineResult,
    contestDeadlineResult,
  ];

  const firstRejectedResult = results.find((result) => result.status === 'rejected');

  if (results.every((result) => result.status === 'rejected') && firstRejectedResult?.status === 'rejected') {
    throw firstRejectedResult.reason;
  }

  const getSettledPostings = (result: PromiseSettledResult<Posting[]>) =>
    result.status === 'fulfilled' ? result.value : [];

  return {
    popularPostings: getSettledPostings(popularResult),
    recentViewedPostings: getSettledPostings(recentViewedResult),
    deadlinePostings: {
      SCHOLARSHIP: getSettledPostings(scholarshipDeadlineResult),
      CONTEST: getSettledPostings(contestDeadlineResult),
    },
  };
};

export const getSavedPostings = async ({
  category = 'ALL',
  sort = 'DEADLINE',
  cursor,
  size,
}: GetSavedPostingsParams = {}): Promise<Posting[]> => {
  const { data } = await axiosInstance.get<ApiResponse<ApiSavedPostingsPayload> | ApiSavedPostingsPayload>(
    '/api/v1/saved-posts',
    {
      params: {
        category,
        sort,
        cursor,
        size,
      },
    },
  );

  return mapApiSavedPostingList(normalizeSavedPostingsPayload(unwrapApiData<ApiSavedPostingsPayload>(data)));
};

const getPostingDetailLookupOrder = (preferredType?: PostingType): PostingType[] => {
  if (preferredType === 'CONTEST') return ['CONTEST', 'SCHOLARSHIP'];
  return ['SCHOLARSHIP', 'CONTEST'];
};

export const getPostingById = async (
  postingId: number,
  preferredType?: PostingType,
): Promise<Posting | null> => {
  for (const postingType of getPostingDetailLookupOrder(preferredType)) {
    try {
      return await getPostingDetailByType(postingId, postingType);
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  return null;
};

export const startPostingApplication = async (
  postingId: number,
): Promise<PostingApplicationResult> => {
  const { data } = await axiosInstance.patch<ApiResponse<ApiPostingApplication> | ApiPostingApplication>(
    `/api/v1/posts/${postingId}/application`,
  );

  return mapApiPostingApplication(unwrapApiData<ApiPostingApplication>(data));
};

export const completePostingApplication = async (
  userApplicationId: number,
): Promise<PostingApplicationResult> => {
  const { data } = await axiosInstance.patch<ApiResponse<ApiPostingApplication> | ApiPostingApplication>(
    `/api/v1/user-applications/${userApplicationId}/status`,
    { status: 'PENDING_RESULT' },
  );

  return mapApiPostingApplication(unwrapApiData<ApiPostingApplication>(data));
};

export const toggleSave = async (
  postingId: number,
  isSaved: boolean,
  savedId?: number,
): Promise<ToggleSaveResult> => {
  if (isSaved) {
    const targetSavedId = savedId ?? (await findSavedIdByPostingId(postingId));

    if (!targetSavedId) {
      throw new Error('저장 해제에 필요한 savedId가 없습니다.');
    }

    const { data } = await axiosInstance.delete<ApiResponse<ApiSavedPosting> | ApiSavedPosting>(
      `/api/v1/saved-posts/${targetSavedId}`,
    );
    const deletedPosting = unwrapApiData<ApiSavedPostMutationPayload>(data);

    return {
      isSaved: false,
      savedId: getSavedIdFromPayload(deletedPosting, targetSavedId),
    };
  }

  const { data } = await axiosInstance.post<ApiResponse<ApiSavedPosting> | ApiSavedPosting>(
    '/api/v1/saved-posts',
    { postId: postingId },
  );
  const savedPostingPayload = unwrapApiData<ApiSavedPosting>(data);
  const savedPosting = mapApiSavedPostingToPosting(savedPostingPayload);

  return {
    isSaved: true,
    savedId: getSavedIdFromPayload(savedPostingPayload, savedPosting.savedId),
  };
};
