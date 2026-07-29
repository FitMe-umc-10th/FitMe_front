export interface SearchPostItem {
  postId: number;
  type: 'SCHOLARSHIP' | 'CONTEST';
  title: string;
  deadlineDate: string;
  deadlineLabel: string;
  organization: string;
  thumbnailUrl: string;
  category: string | null;
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
  posts: SearchPostItem[];
  pageInfo: SearchPageInfo;
}
