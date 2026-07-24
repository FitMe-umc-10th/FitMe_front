export const postingQueryKeys = {
  all: ['postings'] as const,
  home: ['postings', 'home'] as const,
  recentViewed: ['postings', 'recentViewed'] as const,
  detail: (postingId: number) => ['postings', 'detail', postingId] as const,
  deadline: ['postings', 'deadline'] as const,
  saved: ['postings', 'saved'] as const,
};
