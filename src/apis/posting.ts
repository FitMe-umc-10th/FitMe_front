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
  type ApiPopularPostingsResponse,
  type ApiRecentViewedPostingsResponse,
  mapApiPostingList,
  mapApiSavedPostingList,
  mapApiSavedPostingToPosting,
  type ApiSavedPosting,
} from '@/apis/postingMapper';
import type { ApiResponse } from '@/types/common';

const DEFAULT_HOME_POPULAR_SIZE = 8;
const DEFAULT_HOME_RECENT_VIEWED_SIZE = 10;
const DEFAULT_HOME_CLOSING_SOON_SIZE = 5;

type ApiPostingType = PostingType | 'SCHOLARSHIP' | 'CONTEST' | string;

type SavedPostingsPayload =
  | ApiSavedPosting[]
  | {
      items?: ApiSavedPosting[];
      savedPosts?: ApiSavedPosting[];
      savedPostings?: ApiSavedPosting[];
      postings?: ApiSavedPosting[];
      content?: ApiSavedPosting[];
    };

type SavedPostMutationPayload = Partial<ApiSavedPosting> | number | string | null | undefined;

export interface ToggleSaveResult {
  isSaved: boolean;
  savedId?: number;
}

export type PostingApplicationStatus =
  | 'NONE'
  | 'PENDING_RESULT'
  | 'DOCUMENT_PASSED'
  | 'FINAL_PASSED';

export interface PostingApplicationResult {
  userApplicationId: number;
  postId?: number;
  status: PostingApplicationStatus;
  isApplied: boolean;
  applicationUrl?: string;
}

interface ApiPostingApplication {
  userApplicationId?: number;
  postId?: number;
  status?: PostingApplicationStatus | string;
  isApplied?: boolean;
  applicationUrl?: string;
}

interface ApiPostingDetail {
  id?: number;
  postId?: number;
  savedId?: number;
  announcementId?: number;
  type?: ApiPostingType;
  postType?: ApiPostingType;
  announcementType?: ApiPostingType;
  title?: string;
  name?: string;
  organizer?: string;
  oraganizer?: string;
  organization?: string;
  organizationName?: string;
  deadline?: string;
  deadlineDate?: string;
  endDate?: string;
  applyStartDate?: string;
  applyEndDate?: string;
  posterUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  posterImageUrl?: string;
  isSaved?: boolean;
  issaved?: boolean;
  saved?: boolean;
  category?: string;
  createdAt?: string;
  viewCount?: number;
  views?: number;
  savedCount?: number;
  active?: boolean;
  viewedAt?: string;
  recentViewedAt?: string;
  isMatched?: boolean;
  matched?: boolean;
  aiSummary?: string;
  summary?: string;
  aiDescription?: string;
  applicationUrl?: string;
  applyUrl?: string;
  homepageUrl?: string;
  officialUrl?: string;
  applyMethod?: string;
  receptionMethod?: string;
  startDate?: string;
  recruitmentStartDate?: string;
  recruitmentEndDate?: string;
  benefitTarget?: string;
  award?: string;
  prize?: string;
  topPrize?: string;
  supportBenefit?: string;
  extraBenefit?: string;
  education?: string;
  qualification?: string;
  eligibility?: string;
  headcount?: string;
  personnel?: string;
  scholarshipDetail?: {
    supportAmount?: string;
    gradeRequirement?: string;
    incomeRequirement?: string;
    regionRequirement?: string;
  };
  contestDetail?: {
    posterImageUrl?: string;
    target?: string;
    participantLimit?: string;
    rewardTotal?: string;
  };
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

const normalizeSavedPostingsPayload = (payload: SavedPostingsPayload): ApiSavedPosting[] => {
  if (Array.isArray(payload)) return payload;

  return (
    payload.items ??
    payload.savedPosts ??
    payload.savedPostings ??
    payload.postings ??
    payload.content ??
    []
  );
};

const getSavedIdFromPayload = (payload: SavedPostMutationPayload, fallback?: number) => {
  if (typeof payload === 'number') return payload;

  if (typeof payload === 'string') {
    const parsedSavedId = Number(payload);
    return Number.isFinite(parsedSavedId) ? parsedSavedId : fallback;
  }

  if (payload && typeof payload.savedId === 'number') {
    return payload.savedId;
  }

  return fallback;
};

const findSavedIdByPostingId = async (postingId: number) => {
  const { data } = await axiosInstance.get<ApiResponse<SavedPostingsPayload> | SavedPostingsPayload>(
    '/api/v1/saved-posts',
    {
      params: {
        category: 'ALL',
        sort: 'DEADLINE',
        size: 100,
      },
    },
  );
  const savedPostings = normalizeSavedPostingsPayload(unwrapApiData<SavedPostingsPayload>(data));
  const savedPosting = savedPostings.find((posting) => posting.postId === postingId || posting.id === postingId);

  return savedPosting?.savedId;
};

const mapApiPostingApplication = (application: ApiPostingApplication): PostingApplicationResult => {
  if (typeof application.userApplicationId !== 'number') {
    throw new Error('지원 이력 ID가 응답에 없습니다.');
  }

  return {
    userApplicationId: application.userApplicationId,
    postId: application.postId,
    status: (application.status ?? 'NONE') as PostingApplicationStatus,
    isApplied: application.isApplied ?? false,
    applicationUrl: application.applicationUrl,
  };
};

const normalizePostingType = (type?: ApiPostingType): PostingType => {
  if (type === 'CONTEST') return 'CONTEST';
  return 'SCHOLARSHIP';
};

const formatPeriodDate = (posting: ApiPostingDetail) => {
  const startDate = posting.startDate ?? posting.applyStartDate ?? posting.recruitmentStartDate;
  const endDate =
    posting.deadline ??
    posting.deadlineDate ??
    posting.applyEndDate ??
    posting.endDate ??
    posting.recruitmentEndDate;

  if (startDate && endDate) return `${startDate} ~ ${endDate}`;
  return endDate ?? '';
};

const mapApiPostingDetailToPosting = (posting: ApiPostingDetail, fallbackType: PostingType): Posting => ({
  id: posting.postId ?? posting.id ?? posting.announcementId ?? 0,
  type: normalizePostingType(posting.type ?? posting.postType ?? posting.announcementType ?? fallbackType),
  title: posting.title ?? posting.name ?? '제목 정보 없음',
  organization:
    posting.organizer ?? posting.oraganizer ?? posting.organization ?? posting.organizationName ?? '기관 정보 없음',
  deadline:
    posting.deadline ?? posting.deadlineDate ?? posting.applyEndDate ?? posting.endDate ?? posting.recruitmentEndDate ?? '',
  posterUrl:
    posting.posterUrl ??
    posting.imageUrl ??
    posting.thumbnailUrl ??
    posting.posterImageUrl ??
    posting.contestDetail?.posterImageUrl ??
    '',
  savedId: posting.savedId,
  isSaved: posting.isSaved ?? posting.issaved ?? posting.saved ?? false,
  category: posting.category,
  createdAt: posting.createdAt,
  views: posting.views ?? posting.viewCount ?? 0,
  viewCount: posting.viewCount ?? posting.views ?? 0,
  savedCount: posting.savedCount ?? 0,
  active: posting.active,
  viewedAt: posting.viewedAt ?? posting.recentViewedAt,
  isMatched: posting.isMatched ?? posting.matched,
  aiSummary: posting.aiSummary ?? posting.summary ?? posting.aiDescription,
  applyUrl: posting.applicationUrl ?? posting.applyUrl ?? posting.homepageUrl ?? posting.officialUrl,
  period: {
    date: formatPeriodDate(posting),
    method: posting.applyMethod ?? posting.receptionMethod,
  },
  benefit: {
    target: posting.benefitTarget ?? posting.contestDetail?.target ?? posting.award ?? posting.prize,
    grandPrize: posting.topPrize,
    support: posting.supportBenefit ?? posting.scholarshipDetail?.supportAmount ?? posting.contestDetail?.rewardTotal ?? posting.extraBenefit,
  },
  eligibility: {
    education:
      posting.education ??
      posting.scholarshipDetail?.gradeRequirement ??
      posting.scholarshipDetail?.incomeRequirement ??
      posting.scholarshipDetail?.regionRequirement ??
      posting.qualification ??
      posting.eligibility,
    headcount: posting.headcount ?? posting.contestDetail?.participantLimit ?? posting.personnel,
  },
});

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
  const { data } = await axiosInstance.get<ApiResponse<SavedPostingsPayload> | SavedPostingsPayload>(
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

  return mapApiSavedPostingList(normalizeSavedPostingsPayload(unwrapApiData<SavedPostingsPayload>(data)));
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
    const deletedPosting = unwrapApiData<SavedPostMutationPayload>(data);

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
