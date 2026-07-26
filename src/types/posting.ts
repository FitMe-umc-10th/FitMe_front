export type PostingType = 'SCHOLARSHIP' | 'CONTEST';

export interface Posting {
  postId: number;
  postType: PostingType;
  title: string;
  organizer: string;
  applyStartAt: string;
  applyEndAt: string;
  summary: string;
  applicationMethod: string;
  applicationUrl: string;
  viewCount: number;
  savedCount: number;
  scholarship?: {
    gradeRequirement: string;
    incomeRequirement: string;
    regionRequirement: string;
    supportAmount: string;
  };
}

export interface HomePostingFeed {
  popularPostings: Posting[];
  recentViewedPostings: Posting[];
  deadlinePostings: Record<PostingType, Posting[]>;
}
