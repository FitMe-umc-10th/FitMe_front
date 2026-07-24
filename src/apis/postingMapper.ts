import type { HomePostingFeed, Posting, PostingType } from '@/types/posting';

export interface ApiPostingSummary {
  postId: number;
  type: PostingType;
  title: string;
  organization: string;
  thumbnailUrl?: string | null;
  deadlineDate?: string | null;
  deadlineLabel?: string | null;
  saved?: boolean;
  category?: string | null;
  createdAt?: string | null;
  viewedAt?: string | null;
  viewCount?: number | null;
  savedCount?: number | null;
  isMatched?: boolean | null;
}

export interface ApiSavedPosting extends ApiPostingSummary {
  savedId: number;
  savedAt?: string | null;
}

export interface ApiPageInfo {
  hasNext: boolean;
  nextIdCursor?: number | null;
  nextDeadlineCursor?: string | null;
  pageSize: number;
}

export interface ApiListResponse<T> {
  items: T[];
  pageInfo?: ApiPageInfo;
}

export interface ApiHomePostingFeed {
  popularPostings: ApiPostingSummary[];
  recentViewedPostings: ApiPostingSummary[];
  deadlinePostings: Record<PostingType, ApiPostingSummary[]>;
}

const DEFAULT_DEADLINE = '2099-12-31';

const getDeadlineFromLabel = (deadlineLabel?: string | null) => {
  if (!deadlineLabel) return DEFAULT_DEADLINE;
  if (deadlineLabel === '마감') return new Date().toISOString().slice(0, 10);

  const matchedDays = deadlineLabel.match(/^D-(\d+)$/);
  if (!matchedDays) return DEFAULT_DEADLINE;

  const date = new Date();
  date.setDate(date.getDate() + Number(matchedDays[1]));
  return date.toISOString().slice(0, 10);
};

export const mapApiPostingToPosting = (posting: ApiPostingSummary): Posting => ({
  id: posting.postId,
  type: posting.type,
  title: posting.title,
  organization: posting.organization,
  deadline: posting.deadlineDate ?? getDeadlineFromLabel(posting.deadlineLabel),
  posterUrl: posting.thumbnailUrl ?? '',
  isSaved: posting.saved ?? false,
  category: posting.category ?? undefined,
  createdAt: posting.createdAt ?? undefined,
  viewedAt: posting.viewedAt ?? undefined,
  viewCount: posting.viewCount ?? undefined,
  views: posting.viewCount ?? undefined,
  savedCount: posting.savedCount ?? undefined,
  isMatched: posting.isMatched ?? undefined,
});

export const mapApiSavedPostingToPosting = (posting: ApiSavedPosting): Posting => ({
  ...mapApiPostingToPosting(posting),
  isSaved: true,
  createdAt: posting.savedAt ?? posting.createdAt ?? undefined,
});

export const mapApiPostingList = (postings: ApiPostingSummary[]): Posting[] =>
  postings.map(mapApiPostingToPosting);

export const mapApiSavedPostingList = (postings: ApiSavedPosting[]): Posting[] =>
  postings.map(mapApiSavedPostingToPosting);

export const mapApiHomePostingFeed = (feed: ApiHomePostingFeed): HomePostingFeed => ({
  popularPostings: mapApiPostingList(feed.popularPostings),
  recentViewedPostings: mapApiPostingList(feed.recentViewedPostings),
  deadlinePostings: {
    SCHOLARSHIP: mapApiPostingList(feed.deadlinePostings.SCHOLARSHIP),
    CONTEST: mapApiPostingList(feed.deadlinePostings.CONTEST),
  },
});
