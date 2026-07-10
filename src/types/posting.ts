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
  category?: string; // 공모전 분야 (마케팅, 디자인, IT/개발 등)
  createdAt?: string; // 등록일자 (최신순 정렬용, YYYY-MM-DD 형식)
  views?: number; // 조회수 (인기순 정렬용)
}
