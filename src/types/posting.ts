export type PostingType = 'SCHOLARSHIP' | 'CONTEST';

export interface Posting {
  id: number;
  savedId?: number;
  type: PostingType;
  title: string;
  organization: string;
  deadline: string; // ISO 날짜 (D-Day 계산용)
  posterUrl: string;
  isSaved: boolean; // 찜 여부
  category?: string; // 공모전 분야 (마케팅, 디자인, IT/개발 등)
  createdAt?: string; // 등록일자 (최신순 정렬용, YYYY-MM-DD 형식)
  views?: number; // 조회수 (인기순 정렬용)
  viewCount?: number; // upstream
  savedCount?: number; // upstream
  viewedAt?: string;
  isMatched?: boolean;
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
  size?: number;
}
