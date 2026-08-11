import type { Posting, PostingType } from '@/types/posting';

export interface ApiPostingSummary {
  id?: number;
  postId?: number;
  type?: PostingType | null;
  title?: string | null;
  organizer?: string | null;
  oraganizer?: string | null;
  organization?: string | null;
  thumbnailUrl?: string | null;
  deadlineDate?: string | null;
  deadlineLabel?: number | string | null;
  isSaved?: boolean;
  saved?: boolean;
  savedId?: number | null;
  category?: string | null;
  createdAt?: string | null;
  viewedAt?: string | null;
  viewCount?: number | null;
  savedCount?: number | null;
  active?: boolean | null;
  isMatched?: boolean | null;
}

export interface ApiSavedPosting extends ApiPostingSummary {
  savedId: number;
  savedAt?: string | null;
}

const DEFAULT_DEADLINE = '2099-12-31';

export interface ApiRecentViewedPostingsResponse {
  hasNext: boolean;
  nextCursor?: number | null;
  posts: ApiPostingSummary[];
}

export interface ApiPopularPostingsResponse {
  posts?: ApiPostingSummary[];
  popularPosts?: ApiPostingSummary[];
  hasNext: boolean;
  nextIdCursor?: number | null;
  nextDeadlineCursor?: string | null;
}

export type ApiClosingSoonPostingsResponse = ApiPostingSummary[];

export type ApiPostingType = PostingType | 'SCHOLARSHIP' | 'CONTEST' | string | null;

export type PostingApplicationStatus =
  | 'NONE'
  | 'PENDING_RESULT'
  | 'DOCUMENT_PASSED'
  | 'FINAL_PASSED';

export interface PostingApplicationResult {
  userApplicationId: number;
  postId?: number;
  status: PostingApplicationStatus;
  isApplied: boolean;
  applicationUrl?: string;
}

export interface ApiPostingApplication {
  userApplicationId?: number;
  postId?: number;
  status?: PostingApplicationStatus | string;
  isApplied?: boolean;
  applicationUrl?: string;
}

export interface ApiPostingDetail {
  id?: number;
  postId?: number;
  savedId?: number;
  announcementId?: number;
  type?: ApiPostingType;
  postType?: ApiPostingType;
  announcementType?: ApiPostingType;
  title?: string;
  name?: string;
  organizer?: string;
  oraganizer?: string;
  organization?: string;
  organizationName?: string;
  deadline?: string;
  deadlineDate?: string;
  endDate?: string;
  applyStartDate?: string;
  applyEndDate?: string;
  posterUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  posterImageUrl?: string;
  isSaved?: boolean;
  issaved?: boolean;
  saved?: boolean;
  category?: string;
  createdAt?: string;
  viewCount?: number;
  views?: number;
  savedCount?: number;
  active?: boolean;
  viewedAt?: string;
  recentViewedAt?: string;
  isMatched?: boolean;
  matched?: boolean;
  aiSummary?: string;
  summary?: string;
  aiDescription?: string;
  applicationUrl?: string;
  applyUrl?: string;
  homepageUrl?: string;
  officialUrl?: string;
  applyMethod?: string;
  receptionMethod?: string;
  startDate?: string;
  recruitmentStartDate?: string;
  recruitmentEndDate?: string;
  benefitTarget?: string;
  award?: string;
  prize?: string;
  topPrize?: string;
  supportBenefit?: string;
  extraBenefit?: string;
  education?: string;
  qualification?: string;
  eligibility?: string;
  headcount?: string;
  personnel?: string;
  scholarshipDetail?: {
    supportAmount?: string;
    gradeRequirement?: string;
    incomeRequirement?: string;
    regionRequirement?: string;
  };
  contestDetail?: {
    posterImageUrl?: string;
    target?: string;
    participantLimit?: string;
    rewardTotal?: string;
  };
}

const getDeadlineFromLabel = (deadlineLabel?: number | string | null) => {
  if (deadlineLabel === undefined || deadlineLabel === null || deadlineLabel === '') {
    return DEFAULT_DEADLINE;
  }

  if (typeof deadlineLabel === 'number') {
    const date = new Date();
    date.setDate(date.getDate() + deadlineLabel);
    return date.toISOString().slice(0, 10);
  }

  if (deadlineLabel === '마감' || deadlineLabel === 'D-Day') {
    return new Date().toISOString().slice(0, 10);
  }

  const matchedDays = deadlineLabel.match(/^D-(\d+)$/);
  if (!matchedDays) return DEFAULT_DEADLINE;

  const date = new Date();
  date.setDate(date.getDate() + Number(matchedDays[1]));
  return date.toISOString().slice(0, 10);
};

export const mapApiPostingToPosting = (posting: ApiPostingSummary): Posting => ({
  id: posting.postId ?? posting.id ?? 0,
  savedId: posting.savedId ?? undefined,
  type: posting.type ?? 'SCHOLARSHIP',
  title: posting.title?.trim() || '제목 없는 공고',
  organization:
    posting.organizer?.trim() ||
    posting.oraganizer?.trim() ||
    posting.organization?.trim() ||
    '기관 정보 없음',
  deadline: posting.deadlineDate ?? getDeadlineFromLabel(posting.deadlineLabel),
  posterUrl: posting.thumbnailUrl ?? '',
  isSaved: posting.isSaved ?? posting.saved ?? false,
  category: posting.category ?? undefined,
  createdAt: posting.createdAt ?? undefined,
  viewedAt: posting.viewedAt ?? undefined,
  viewCount: posting.viewCount ?? undefined,
  views: posting.viewCount ?? undefined,
  savedCount: posting.savedCount ?? undefined,
  active: posting.active ?? undefined,
  isMatched: posting.isMatched ?? undefined,
});

export const mapApiSavedPostingToPosting = (posting: ApiSavedPosting): Posting => {
  const mappedPosting = mapApiPostingToPosting(posting);

  return {
    ...mappedPosting,
    savedId: posting.savedId,
    isSaved: true,
    createdAt: posting.savedAt ?? posting.createdAt ?? undefined,
  };
};

export const mapApiPostingList = (postings: ApiPostingSummary[]): Posting[] =>
  postings.map(mapApiPostingToPosting);

export const mapApiSavedPostingList = (postings: ApiSavedPosting[]): Posting[] =>
  postings.map(mapApiSavedPostingToPosting);

export const mapApiPostingApplication = (application: ApiPostingApplication): PostingApplicationResult => {
  if (typeof application.userApplicationId !== 'number') {
    throw new Error('지원 이력 ID가 응답에 없습니다.');
  }

  return {
    userApplicationId: application.userApplicationId,
    postId: application.postId,
    status: (application.status ?? 'NONE') as PostingApplicationStatus,
    isApplied: application.isApplied ?? false,
    applicationUrl: application.applicationUrl,
  };
};

const normalizePostingType = (type?: ApiPostingType): PostingType => {
  if (type === 'CONTEST') return 'CONTEST';
  return 'SCHOLARSHIP';
};

const formatPeriodDate = (posting: ApiPostingDetail) => {
  const startDate = posting.startDate ?? posting.applyStartDate ?? posting.recruitmentStartDate;
  const endDate =
    posting.deadline ??
    posting.deadlineDate ??
    posting.applyEndDate ??
    posting.endDate ??
    posting.recruitmentEndDate;

  if (startDate && endDate) return `${startDate} ~ ${endDate}`;
  return endDate ?? '';
};

export const mapApiPostingDetailToPosting = (
  posting: ApiPostingDetail,
  fallbackType: PostingType,
): Posting => ({
  id: posting.postId ?? posting.id ?? posting.announcementId ?? 0,
  type: normalizePostingType(posting.type ?? posting.postType ?? posting.announcementType ?? fallbackType),
  title: posting.title ?? posting.name ?? '제목 정보 없음',
  organization:
    posting.organizer ?? posting.oraganizer ?? posting.organization ?? posting.organizationName ?? '기관 정보 없음',
  deadline:
    posting.deadline ??
    posting.deadlineDate ??
    posting.applyEndDate ??
    posting.endDate ??
    posting.recruitmentEndDate ??
    '',
  posterUrl:
    posting.posterUrl ??
    posting.imageUrl ??
    posting.thumbnailUrl ??
    posting.posterImageUrl ??
    posting.contestDetail?.posterImageUrl ??
    '',
  savedId: posting.savedId,
  isSaved: posting.isSaved ?? posting.issaved ?? posting.saved ?? false,
  category: posting.category,
  createdAt: posting.createdAt,
  views: posting.views ?? posting.viewCount ?? 0,
  viewCount: posting.viewCount ?? posting.views ?? 0,
  savedCount: posting.savedCount ?? 0,
  active: posting.active,
  viewedAt: posting.viewedAt ?? posting.recentViewedAt,
  isMatched: posting.isMatched ?? posting.matched,
  aiSummary: posting.aiSummary ?? posting.summary ?? posting.aiDescription,
  applyUrl: posting.applicationUrl ?? posting.applyUrl ?? posting.homepageUrl ?? posting.officialUrl,
  period: {
    date: formatPeriodDate(posting),
    method: posting.applyMethod ?? posting.receptionMethod,
  },
  benefit: {
    target: posting.benefitTarget ?? posting.contestDetail?.target ?? posting.award ?? posting.prize,
    grandPrize: posting.topPrize,
    support:
      posting.supportBenefit ??
      posting.scholarshipDetail?.supportAmount ??
      posting.contestDetail?.rewardTotal ??
      posting.extraBenefit,
  },
  eligibility: {
    education:
      posting.education ??
      posting.scholarshipDetail?.gradeRequirement ??
      posting.scholarshipDetail?.incomeRequirement ??
      posting.scholarshipDetail?.regionRequirement ??
      posting.qualification ??
      posting.eligibility,
    headcount: posting.headcount ?? posting.contestDetail?.participantLimit ?? posting.personnel,
  },
});
