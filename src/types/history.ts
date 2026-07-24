import type { Posting } from './posting';

export type HistoryStatus = 'DRAFT' | 'IN_PROGRESS' | 'DOCUMENT_PASS' | 'FINAL_PASSED';

// 1. 목록 조회 전용 Item
export interface UserApplicationListItem {
  userApplicationId: number;
  postId: number;
  postType: string;
  title: string;
  organizer: string;
  posterImageUrl: string;
  status: HistoryStatus;
  isApplied: boolean;
  updatedAt: string;
  memo: string;
}
// 2. 상세 조회 전용 DTO
export interface UserApplicationDetail {
  userApplicationId: number;
  status: HistoryStatus;
  isApplied: boolean;
  memo: string;
  post: Posting;
}
