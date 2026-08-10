export type PostingType = 'SCHOLARSHIP' | 'CONTEST';

export interface Posting {
  id: number;
  savedId?: number;
  type: PostingType;
  title: string;

  // 기관 / 주최 정보
  organization?: string;
  organizer?: string;

  // 일자 및 D-Day 관련
  deadline?: string; // ISO 날짜 (D-Day 계산용)
  applyStartAt?: string;
  applyEndAt?: string;
  createdAt?: string;
  viewedAt?: string;

  // 이미지 및 상태 정보
  posterUrl?: string;
  isSaved: boolean;
  isMatched?: boolean;
  category?: string;

  // 조회수 및 스크랩수
  views?: number;
  viewCount?: number;
  savedCount?: number;

  // 상세 설명 및 지원 링크
  summary?: string;
  aiSummary?: string;
  applicationMethod?: string;
  applicationUrl?: string;
  applyUrl?: string;

  // 상세 정보 객체 (장학금 / 공모전 혜택 및 자격 요건)
  scholarship?: {
    gradeRequirement: string;
    incomeRequirement: string;
    regionRequirement: string;
    supportAmount: string;
  };
  period?: {
    date?: string;
    method?: string;
  };
  benefit?: {
    target?: string;
    grandPrize?: string;
    support?: string;
  };
  eligibility?: {
    education?: string;
    headcount?: string;
  };
}

export interface HomePostingFeed {
  popularPostings: Posting[];
  recentViewedPostings: Posting[];
  deadlinePostings: Record<PostingType, Posting[]>;
}

export type PostingCategoryFilter = PostingType | 'ALL';
export type PostingSort = 'RECENT' | 'DEADLINE';

export interface CursorPageParams {
  cursor?: string;
  size?: number;
}

export interface GetSavedPostingsParams extends CursorPageParams {
  category?: PostingCategoryFilter;
  sort?: PostingSort;
}

export interface GetHomePostingListParams {
  cursor?: number;
  size?: number;
}

export interface GetRecentViewedPostingsParams {
  page?: number;
  size?: number;
}

export interface GetClosingSoonPostingsParams {
  type: PostingCategoryFilter;
  sort?: 'FIT' | 'DEADLINE' | 'RECENT';
  size?: number;
}
