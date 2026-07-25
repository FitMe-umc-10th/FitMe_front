import type {
  GetHomePostingListParams,
  GetSavedPostingsParams,
  HomePostingFeed,
  Posting,
  PostingType,
} from '@/types/posting';
import { MOCK_POSTINGS } from '@/constants/mockData';
import { getDDayDays } from '@/shared/utils/date';

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
const DEFAULT_HOME_POSTING_SIZE = 5;

type MockSavedPostings = Record<number, boolean>;

const waitMockNetwork = (delayMs = MOCK_NETWORK_DELAY_MS) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

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
  [...postings].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

const sortBySavedCountDesc = (postings: Posting[]) =>
  [...postings].sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0));

const getMatchedDeadlinePostings = (postings: Posting[], type: PostingType) => {
  const matchedPostings = postings.filter((posting) => posting.type === type && posting.isMatched);

  if (matchedPostings.length > 0) {
    return sortByDeadlineAsc(matchedPostings);
  }

  return sortBySavedCountDesc(postings).slice(0, 5);
};

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
        p.organization.toLowerCase().includes(query)
    );
  }

  // 4. 정렬
  if (sortBy === 'deadline') {
    // 마감 임박순
    filtered.sort((a, b) => {
      const daysA = getDDayDays(a.deadline);
      const daysB = getDDayDays(b.deadline);
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
  size = DEFAULT_HOME_POSTING_SIZE,
}: GetHomePostingListParams = {}): Promise<Posting[]> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();

  return [...postings]
    .sort((a, b) => (b.viewCount ?? b.views ?? 0) - (a.viewCount ?? a.views ?? 0))
    .slice(0, size);
};

export const getRecentViewedPostings = async ({
  size,
}: GetHomePostingListParams = {}): Promise<Posting[]> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();
  const recentViewedPostings = postings
    .filter((posting) => posting.viewedAt)
    .sort((a, b) => new Date(b.viewedAt ?? '').getTime() - new Date(a.viewedAt ?? '').getTime());

  return typeof size === 'number' ? recentViewedPostings.slice(0, size) : recentViewedPostings;
};

export const getClosingSoonPostings = async (type: PostingType): Promise<Posting[]> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();

  return getMatchedDeadlinePostings(postings, type);
};

export const getHomePostingFeed = async (): Promise<HomePostingFeed> => {
  const [popularPostings, recentViewedPostings, scholarshipDeadlinePostings, contestDeadlinePostings] =
    await Promise.all([
      getPopularPostings({ size: DEFAULT_HOME_POSTING_SIZE }),
      getRecentViewedPostings({ size: DEFAULT_HOME_POSTING_SIZE }),
      getClosingSoonPostings('SCHOLARSHIP'),
      getClosingSoonPostings('CONTEST'),
    ]);

  return {
    popularPostings,
    recentViewedPostings,
    deadlinePostings: {
      SCHOLARSHIP: scholarshipDeadlinePostings,
      CONTEST: contestDeadlinePostings,
    },
  };
};

export const getSavedPostings = async ({
  category = 'ALL',
  sort = 'DEADLINE',
}: GetSavedPostingsParams = {}): Promise<Posting[]> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();
  const savedPostings = filterByPostingType(
    postings.filter((posting) => posting.isSaved),
    category,
  );

  return sortSavedPostings(savedPostings, sort);
};

export const getPostingById = async (postingId: number): Promise<Posting | null> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();

  return postings.find((posting) => posting.id === postingId) ?? null;
};

export const getDeadlinePostings = async (): Promise<Posting[]> => {
  await waitMockNetwork();
  const postings = applyMockSavedPostings();

  return sortByDeadlineAsc(postings);
};

export const toggleSave = async (postingId: number, isSaved: boolean): Promise<boolean> => {
  await waitMockNetwork(); // 네트워크 흉내

  // 10% 확률로 실패 시나리오
  if (Math.random() < 0.1) {
    throw new Error('토글에 실패했습니다.');
  }

  // 메모리 상의 mock 데이터를 실제로 업데이트하여 refetch 시에도 상태가 보존되게 함
  const target = applyMockSavedPostings().find((p) => p.id === postingId);
  const nextSavedState = !isSaved;

  if (target) {
    target.isSaved = nextSavedState;
    target.savedId = nextSavedState ? target.savedId ?? postingId : undefined;
    target.savedCount = Math.max(0, (target.savedCount ?? 0) + (nextSavedState ? 1 : -1));
    writeMockSavedPosting(postingId, nextSavedState);
  }

  return nextSavedState; // 정상 처리 시 반전된 값 반환
};
