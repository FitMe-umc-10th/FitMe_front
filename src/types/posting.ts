export type PostingType = 'SCHOLARSHIP' | 'CONTEST';

export interface Posting {
  id: number;
  savedId?: number;
  type: PostingType;
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
