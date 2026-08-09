export interface SearchPostItem {
  postId: number;
  type: 'SCHOLARSHIP' | 'CONTEST' | 'ALL' | 'ETC';
  title: string;
  deadlineDate: string;
  deadlineLabel: string;
  organization: string;
  thumbnailUrl: string;
  category: 'PM' | 'MARKETING' | 'DESIGN' | 'IT' | 'VIDEO' | 'ETC' | null;
  saved: boolean;
}

export interface SearchNextCursor {
  idCursor?: number;
  deadlineCursor?: string;
}

export interface SearchPageInfo {
  hasNext: boolean;
  nextCursor: SearchNextCursor | null;
  limit: number;
}

export interface SearchPostsResult {
  data: SearchPostItem[];
  hasNext: boolean;
  nextIdCursor?: number;
  nextDeadlineCursor?: string;
  pageSize?: number;
  posts?: SearchPostItem[];
  pageInfo?: SearchPageInfo;
}
