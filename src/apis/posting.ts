import type { HomePostingFeed, Posting, PostingType } from '@/types/posting';
import { MOCK_POSTINGS } from '@/constants/mockData';
// import { axiosInstance } from '@/apis/axiosInstance';

const MOCK_SAVED_POSTINGS_KEY = 'fitme:mockSavedPostings';

type MockSavedPostings = Record<number, boolean>;

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

// === 지금은 mock 반환 (UI 먼저 개발) ===
export const getPostings = async (): Promise<Posting[]> => {
  await new Promise((r) => setTimeout(r, 300)); // 네트워크 흉내
  return applyMockSavedPostings();
};

export const getHomePostingFeed = async (): Promise<HomePostingFeed> => {
  await new Promise((r) => setTimeout(r, 300));
  const postings = applyMockSavedPostings();

  return {
    popularPostings: [...postings].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 5),
    recentViewedPostings: postings
      .filter((posting) => posting.viewedAt)
      .sort((a, b) => new Date(b.viewedAt ?? '').getTime() - new Date(a.viewedAt ?? '').getTime())
      .slice(0, 5),
    deadlinePostings: {
      SCHOLARSHIP: getMatchedDeadlinePostings(postings, 'SCHOLARSHIP'),
      CONTEST: getMatchedDeadlinePostings(postings, 'CONTEST'),
    },
  };
};

export const getRecentViewedPostings = async (): Promise<Posting[]> => {
  await new Promise((r) => setTimeout(r, 300));
  const postings = applyMockSavedPostings();

  return postings
    .filter((posting) => posting.viewedAt)
    .sort((a, b) => new Date(b.viewedAt ?? '').getTime() - new Date(a.viewedAt ?? '').getTime());
};

export const getPostingById = async (postingId: number): Promise<Posting | null> => {
  await new Promise((r) => setTimeout(r, 300));
  const postings = applyMockSavedPostings();

  return postings.find((posting) => posting.id === postingId) ?? null;
};

export const getDeadlinePostings = async (): Promise<Posting[]> => {
  await new Promise((r) => setTimeout(r, 300));
  const postings = applyMockSavedPostings();

  return sortByDeadlineAsc(postings);
};

// === 찜하기 토글 API Mock (낙관적 업데이트 및 롤백 테스트용) ===
export const toggleSave = async (postingId: number, isSaved: boolean): Promise<boolean> => {
  await new Promise((r) => setTimeout(r, 500)); // 500ms 네트워크 지연 모방

  console.log(`[Mock API] toggleSave called for postingId: ${postingId}`);

  // 에러 발생 및 롤백 동작을 테스트할 수 있도록 15% 확률로 실패하게 만듭니다.
  if (Math.random() < 0.15) {
    throw new Error('의도된 서버 에러: 찜하기 상태 변경 실패');
  }

  // 메모리 상의 mock 데이터를 실제로 업데이트하여 refetch 시에도 상태가 보존되게 함
  const target = applyMockSavedPostings().find((p) => p.id === postingId);
  const nextSavedState = !isSaved;

  if (target) {
    target.isSaved = nextSavedState;
    target.savedCount = Math.max(0, (target.savedCount ?? 0) + (nextSavedState ? 1 : -1));
    writeMockSavedPosting(postingId, nextSavedState);
  }

  return nextSavedState; // 정상 처리 시 반전된 값 반환
};

// === 백엔드 Swagger 나오면 이 함수 "내부만" 교체하면 끝 ===
// export const getPostings = async (): Promise<Posting[]> => {
//   const { data } = await axiosInstance.get<Posting[]>('/postings');
//   return data;
// };

// export const toggleSave = async (postingId: number, isSaved: boolean): Promise<boolean> => {
//   // 백엔드 엔드포인트에 맞춰 호출 (예: POST /postings/:id/save)
//   const { data } = await axiosInstance.post<{ isSaved: boolean }>(`/postings/${postingId}/save`);
//   return data.isSaved;
// };
