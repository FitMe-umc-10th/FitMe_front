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
