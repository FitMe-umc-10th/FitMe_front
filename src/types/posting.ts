// 백엔드 Swagger 응답에 맞춰 필드 확정하세요.
export type PostingType = 'SCHOLARSHIP' | 'CONTEST'; // 장학금 / 공모전

export interface Posting {
  id: number;
  type: PostingType;
  title: string;
  organization: string; // 주최/기관
  deadline: string; // ISO 날짜 (D-Day 계산용)
  posterUrl: string;
  isSaved: boolean; // 찜 여부
  viewCount?: number;
  savedCount?: number;
  viewedAt?: string;
  isMatched?: boolean;
}

export interface HomePostingFeed {
  popularPostings: Posting[];
  recentViewedPostings: Posting[];
  deadlinePostings: Record<PostingType, Posting[]>;
}
