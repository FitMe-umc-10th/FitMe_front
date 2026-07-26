import type { GetHomePostingListParams, GetSavedPostingsParams, PostingType } from '@/types/posting';

export const postingQueryKeys = {
  all: ['postings'] as const,
  home: ['postings', 'home'] as const,
  popular: (params?: GetHomePostingListParams) => ['postings', 'popular', params ?? {}] as const,
  recentViewed: ['postings', 'recentViewed'] as const,
  closingSoon: (type?: PostingType) => ['postings', 'closingSoon', type ?? 'ALL'] as const,
  detail: (postingId: number) => ['postings', 'detail', postingId] as const,
  detailByType: (postingType: PostingType, postingId: number) =>
    ['postings', 'detail', postingType, postingId] as const,
  deadline: ['postings', 'deadline'] as const,
  saved: ['postings', 'saved'] as const,
  savedList: (params?: GetSavedPostingsParams) => ['postings', 'saved', params ?? {}] as const,
};
