import type { Posting } from '@/types/posting';
import { MOCK_POSTINGS } from '@/constants/mockData';
import { getDDayDays } from '@/shared/utils/date';
// import { axiosInstance } from '@/apis/axiosInstance';

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

// === 탐색/검색 화면 전용 페이지네이션 및 필터링 Mock API ===
export const getExplorePostings = async ({
  keyword,
  type,
  category,
  sortBy,
  page,
  limit,
}: GetExplorePostingsParams): Promise<ExplorePostingsResponse> => {
  await new Promise((r) => setTimeout(r, 400)); // 400ms 네트워크 지연 흉내

  let filtered = [...MOCK_POSTINGS];

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
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
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

// === 지금은 mock 반환 (UI 먼저 개발) ===
export const getPostings = async (): Promise<Posting[]> => {
  await new Promise((r) => setTimeout(r, 300)); // 네트워크 흉내
  return MOCK_POSTINGS;
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
  const target = MOCK_POSTINGS.find((p) => p.id === postingId);
  if (target) {
    target.isSaved = !isSaved;
  }

  return !isSaved; // 정상 처리 시 반전된 값 반환
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
