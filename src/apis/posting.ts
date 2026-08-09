import axios from 'axios';
import type {
  GetClosingSoonPostingsParams,
  GetHomePostingFeedParams,
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
import { MOCK_POSTINGS } from '@/constants/mockData';
import { getDDayDays } from '@/shared/utils/date';
import type { ApiResponse } from '@/types/common';

export interface GetExplorePostingsParams {
  keyword: string;
  type: 'all' | 'scholarship' | 'contest';
  category?: string;
  sortBy: 'deadline' | 'latest' | 'popular';
  page: number;
  limit: number;
}

export interface ExplorePostingsResponse {
  postings: Posting[];
  nextPage?: number;
  total: number;
}

const MOCK_SAVED_POSTINGS_KEY = 'fitme:mockSavedPostings';
const MOCK_NETWORK_DELAY_MS = 300;
const DEFAULT_HOME_USER_ID = 1;
const DEFAULT_HOME_POPULAR_SIZE = 8;
const DEFAULT_HOME_RECENT_VIEWED_SIZE = 10;
const DEFAULT_HOME_CLOSING_SOON_SIZE = 5;

type MockSavedPostings = Record<number, boolean>;

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

interface ApiPostingDetail {
  id?: number;
  postId?: number;
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

const waitMockNetwork = (delayMs = MOCK_NETWORK_DELAY_MS) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

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
  isSaved: posting.isSaved ?? posting.issaved ?? posting.saved ?? false,
  category: posting.category,
  createdAt: posting.createdAt,
  views: posting.views ?? posting.viewCount ?? 0,
  viewCount: posting.viewCount ?? posting.views ?? 0,
  savedCount: posting.savedCount ?? 0,
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

const readMockSavedPostings = (): MockSavedPostings => {
  try {
    const savedPostings = window.localStorage.getItem(MOCK_SAVED_POSTINGS_KEY);
    if (!savedPostings) return {};

    return JSON.parse(savedPostings) as MockSavedPostings;
  } catch {
    return {};
  }
};

const writeMockSavedPosting = (postingId: number, isSaved: boolean) => {
  const savedPostings = readMockSavedPostings();
  window.localStorage.setItem(
    MOCK_SAVED_POSTINGS_KEY,
    JSON.stringify({ ...savedPostings, [postingId]: isSaved }),
  );
};

const applyMockSavedPostings = () => {
  const savedPostings = readMockSavedPostings();

  MOCK_POSTINGS.forEach((posting) => {
    const savedState = savedPostings[posting.id];
    if (typeof savedState === 'boolean') {
      posting.isSaved = savedState;
    }
    posting.savedId = posting.isSaved ? posting.savedId ?? posting.id : undefined;
  });

  return MOCK_POSTINGS;
};

const sortByDeadlineAsc = (postings: Posting[]) =>
  [...postings].sort((a, b) => {
    const deadlineA = new Date(a.deadline ?? '').getTime();
    const deadlineB = new Date(b.deadline ?? '').getTime();
    const safeDeadlineA = Number.isNaN(deadlineA) ? Number.POSITIVE_INFINITY : deadlineA;
    const safeDeadlineB = Number.isNaN(deadlineB) ? Number.POSITIVE_INFINITY : deadlineB;

    return safeDeadlineA - safeDeadlineB;
  });

const filterByPostingType = (postings: Posting[], type?: PostingType | 'ALL') => {
  if (!type || type === 'ALL') return postings;
  return postings.filter((posting) => posting.type === type);
};

const sortSavedPostings = (postings: Posting[], sort?: GetSavedPostingsParams['sort']) => {
  if (sort === 'DEADLINE') {
    return sortByDeadlineAsc(postings);
  }

  return [...postings].sort((a, b) => {
    const savedIdA = a.savedId ?? a.id;
    const savedIdB = b.savedId ?? b.id;
    return savedIdB - savedIdA;
  });
};

const getMockSavedPostings = (category?: PostingType | 'ALL', sort?: GetSavedPostingsParams['sort']) => {
  const postings = applyMockSavedPostings();
  const savedPostings = filterByPostingType(
    postings.filter((posting) => posting.isSaved),
    category,
  );

  return sortSavedPostings(savedPostings, sort);
};

// === 탐색/검색 화면 전용 페이지네이션 및 필터링 Mock API ===
export const getExplorePostings = async ({
  keyword,
  type,
  category,
  sortBy,
  page,
  limit,
}: GetExplorePostingsParams): Promise<ExplorePostingsResponse> => {
  await waitMockNetwork(400); // 400ms 네트워크 지연 흉내

  let filtered = [...applyMockSavedPostings()];

  // 1. 타입 필터링 (장학금 / 공모전)
  if (type === 'scholarship') {
    filtered = filtered.filter((p) => p.type === 'SCHOLARSHIP');
  } else if (type === 'contest') {
    filtered = filtered.filter((p) => p.type === 'CONTEST');
  }

  // 2. 카테고리 필터링 (공모전 분야 선택 시)
  if (type === 'contest' && category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  // 3. 검색어 필터링 (기관명 또는 제목 포함 여부, 대소문자 무시)
  if (keyword.trim()) {
    const query = keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.organization ?? '').toLowerCase().includes(query)
    );
  }

  // 4. 정렬
  if (sortBy === 'deadline') {
    // 마감 임박순
    filtered.sort((a, b) => {
      const daysA = getDDayDays(a.deadline);
      const daysB = getDDayDays(b.deadline);
      if (daysA === null && daysB === null) return 0;
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      const isClosedA = daysA < 0;
      const isClosedB = daysB < 0;

      // 마감된 것은 가장 아래로 내림
      if (isClosedA && !isClosedB) return 1;
      if (!isClosedA && isClosedB) return -1;
      return daysA - daysB;
    });
  } else if (sortBy === 'latest') {
    // 최신 등록순
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || '1970-01-01').getTime();
      const dateB = new Date(b.createdAt || '1970-01-01').getTime();
      return dateB - dateA;
    });
  } else if (sortBy === 'popular') {
    // 인기순 (조회수순)
    filtered.sort((a, b) => (b.views || b.viewCount || 0) - (a.views || a.viewCount || 0));
  }

  // 5. 페이지네이션 슬라이싱
  const start = page * limit;
  const end = start + limit;
  const pagedPostings = filtered.slice(start, end);
  const nextPage = end < filtered.length ? page + 1 : undefined;

  return {
    postings: pagedPostings,
    nextPage,
    total: filtered.length,
  };
};

export const getPostings = async (): Promise<Posting[]> => {
  await waitMockNetwork(); // 네트워크 흉내
  return applyMockSavedPostings();
};

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
  cursor,
  type = 'ALL',
  size = DEFAULT_HOME_RECENT_VIEWED_SIZE,
}: GetRecentViewedPostingsParams = {}): Promise<Posting[]> => {
  const { data } = await axiosInstance.get('/api/v1/posts/recent-views', {
    params: {
      cursor,
      type,
      size,
    },
  });
  const result = unwrapApiData<ApiRecentViewedPostingsResponse>(data);

  return mapApiPostingList(result.posts ?? []);
};

export const getClosingSoonPostings = async ({
  type,
  category,
  sort = 'FIT',
  deadlineCursor,
  idCursor,
  size = DEFAULT_HOME_CLOSING_SOON_SIZE,
}: GetClosingSoonPostingsParams): Promise<Posting[]> => {
  const { data } = await axiosInstance.get('/api/v1/posts/closing-soon', {
    params: {
      type,
      category,
      sort,
      deadlineCursor,
      idCursor,
      size,
    },
  });
  const result = unwrapApiData<ApiClosingSoonPostingsResponse>(data);

  return mapApiPostingList(result ?? []);
};

export const getHomePostingFeed = async ({
  userId = DEFAULT_HOME_USER_ID,
}: GetHomePostingFeedParams = {}): Promise<HomePostingFeed> => {
  void userId;

  const [popularResult, recentViewedResult, scholarshipDeadlineResult, contestDeadlineResult] =
    await Promise.allSettled([
      getPopularPostings({ size: DEFAULT_HOME_POPULAR_SIZE }),
      getRecentViewedPostings({ type: 'ALL', size: DEFAULT_HOME_RECENT_VIEWED_SIZE }),
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
  try {
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
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('저장 목록 API 호출 실패, mock 데이터로 대체합니다.', error);
      return getMockSavedPostings(category, sort);
    }

    throw error;
  }
};

export const getPostingById = async (postingId: number): Promise<Posting | null> => {
  try {
    return await getPostingDetailByType(postingId, 'SCHOLARSHIP');
  } catch (scholarshipError) {
    if (!isNotFoundError(scholarshipError)) throw scholarshipError;

    try {
      return await getPostingDetailByType(postingId, 'CONTEST');
    } catch (contestError) {
      if (isNotFoundError(contestError)) return null;
      throw contestError;
    }
  }
};

export const getMockPostingById = async (postingId: number): Promise<Posting | null> => {
  await new Promise((r) => setTimeout(r, 300));
  const postings = applyMockSavedPostings();

  return postings.find((posting) => posting.id === postingId) ?? null;
};

export const getDeadlinePostings = async (): Promise<Posting[]> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();

  return sortByDeadlineAsc(postings);
};

export const toggleSave = async (
  postingId: number,
  isSaved: boolean,
  savedId?: number,
): Promise<ToggleSaveResult> => {
  try {
    if (isSaved) {
      if (!savedId) {
        throw new Error('저장 해제에 필요한 savedId가 없습니다.');
      }

      const { data } = await axiosInstance.delete<ApiResponse<ApiSavedPosting> | ApiSavedPosting>(
        `/api/v1/saved-posts/${savedId}`,
      );
      const deletedPosting = unwrapApiData<SavedPostMutationPayload>(data);

      return {
        isSaved: false,
        savedId: getSavedIdFromPayload(deletedPosting, savedId),
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
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw error;
    }

    if (!import.meta.env.DEV) {
      throw error;
    }
  }

  const target = applyMockSavedPostings().find((posting) => posting.id === postingId);
  const nextSavedState = !isSaved;

  if (target) {
    target.isSaved = nextSavedState;
    target.savedId = nextSavedState ? target.savedId ?? postingId : undefined;
    target.savedCount = Math.max(0, (target.savedCount ?? 0) + (nextSavedState ? 1 : -1));
    writeMockSavedPosting(postingId, nextSavedState);
  }

  return { isSaved: nextSavedState, savedId: target?.savedId };
};
