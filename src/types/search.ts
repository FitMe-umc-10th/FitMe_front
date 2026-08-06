interface RecentKeyword {
  searchId: string;
  keyword: string;
}

interface RealtimePost {
  baseTime: string;
  posts: {
    rank: number;
    postId: number;
    type: string;
    title: string;
    fluctuation: string;
  }[];
}

export interface LiveSearchDTO {
  recentKeywords: RecentKeyword[];
  realtimePosts: RealtimePost;
}

// 검색 결과 타입( data 안에 있는 값은 추후 type/posting.ts에 추가할 예정 )
export interface SearchResultsDTO {
  data: {
    postId: number;
    type: string;
    title: string;
    deadlineData: string;
    deadlineLabel: string;
    organization: string;
    thumbnailUrl: string;
    category: string;
    saved: boolean;
  }[];
  hasNext: boolean;
  nextIdCursor: number;
  nextDeadlineCursor: string;
  pageSize: number;
}
