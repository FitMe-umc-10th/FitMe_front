import type { Posting } from './posting';

export type HistoryStatus = 'DRAFT' | 'IN_PROGRESS' | 'DOCUMENT_PASS' | 'FINAL_PASSED';

export interface UserApplication {
  userApplicationId: number;
  status: HistoryStatus;
  isApplied: boolean;
  memo: string;
  post: Posting;
}
