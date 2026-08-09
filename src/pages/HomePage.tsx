import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDeadlineNotifications } from '@/apis/deadlineNotification';
import { getHomePostingFeed } from '@/apis/posting';
import { postingQueryKeys } from '@/apis/postingQueryKeys';
import notificationBellIcon from '@/assets/icons/notification-bell.svg';
import emptyRecentViewedIcon from '@/assets/illustrations/empty-recent-viewed.svg';
import Carousel from '@/shared/components/Carousel';
import EmptyState from '@/shared/components/EmptyState';
import PostingCard from '@/shared/components/PostingCard';
import Skeleton from '@/shared/components/Skeleton';
import { ErrorState, Header, Layout, Logo, Tab, TabBar } from '@/shared/components';
import { useAuthStore } from '@/store/authStore';
import type { Posting, PostingType } from '@/types/posting';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

const deadlineTabs: { label: string; value: PostingType }[] = [
  { label: '장학금', value: 'SCHOLARSHIP' },
  { label: '공모전', value: 'CONTEST' },
];

function SectionHeader({ title, actionLabel = '더보기', onAction }: SectionHeaderProps) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-extrabold leading-snug text-[#202124]">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-[#A1A1A1] transition-colors hover:text-[#6B7280]"
        >
          <span>{actionLabel}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
            <path
              d="M9 18L15 12L9 6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function NotificationButton({ hasUnreadNotification }: { hasUnreadNotification: boolean }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label="알림"
      onClick={() => navigate('/notifications')}
      className="relative flex size-8 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-gray-100"
    >
      <img src={notificationBellIcon} alt="" aria-hidden="true" className="size-[26px]" />
      {hasUnreadNotification && (
        <span className="absolute right-[3px] top-[3px] size-2 rounded-full bg-[#FF2F2F]" />
      )}
    </button>
  );
}

function HorizontalPostingList({ postings }: { postings: Posting[] }) {
  return (
    <div className="flex flex-col gap-3">
      {postings.map((posting) => (
        <PostingCard key={posting.id} posting={posting} variant="horizontal" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);
  const [activeDeadlineTab, setActiveDeadlineTab] = useState<PostingType>('SCHOLARSHIP');
  const [isRecentViewedExpanded, setIsRecentViewedExpanded] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [...postingQueryKeys.home, userId],
    queryFn: () => getHomePostingFeed({ userId }),
  });
  const { data: deadlineNotifications } = useQuery({
    queryKey: ['deadlineNotifications'],
    queryFn: () => getDeadlineNotifications(15),
  });
  const unreadNotificationCount =
    deadlineNotifications?.notifications?.filter((n) => !n.isRead).length ?? 0;

  const deadlinePostings = data?.deadlinePostings[activeDeadlineTab] ?? [];

  return (
    <Layout
      header={
        <Header
          leftSlot={<Logo />}
          className="h-[72px] border-b-0 px-5 pt-3"
          rightSlot={<NotificationButton hasUnreadNotification={unreadNotificationCount > 0} />}
        />
      }
      tabBar={<TabBar />}
      className="bg-white"
    >
      <div className="space-y-8 px-5 pb-6 pt-4">
        {isError && (
          <ErrorState
            message="홈 공고를 불러오지 못했습니다."
            onRetry={() => {
              void refetch();
            }}
          />
        )}

        <section className="space-y-2">
          <SectionHeader title="실시간 인기 공고" />
          {isPending && <Skeleton variant="popular" count={2} />}
          {data && (
            <Carousel showIndicator showProgress loop spotlight storageKey="home-popular-carousel-index">
              {data.popularPostings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} variant="popular" />
              ))}
            </Carousel>
          )}
        </section>

        <section
          className={`relative -mx-5 overflow-hidden bg-[#EEF6FF] px-5 pt-5 ${
            isRecentViewedExpanded ? 'h-[368px]' : 'h-[177px]'
          }`}
        >
          <SectionHeader
            title="현수님의 최근 조회 목록"
            actionLabel={isRecentViewedExpanded ? '작게 보기' : '더보기'}
            onAction={() => {
              setIsRecentViewedExpanded(!isRecentViewedExpanded);
            }}
          />
          {isPending && <Skeleton variant="card" count={2} />}
          {data && data.recentViewedPostings.length > 0 && !isRecentViewedExpanded && (
            <div className="mt-5">
              <Carousel storageKey="home-recent-carousel-index">
                {data.recentViewedPostings.map((posting) => (
                  <PostingCard key={posting.id} posting={posting} variant="vertical" />
                ))}
              </Carousel>
            </div>
          )}
          {data && data.recentViewedPostings.length > 0 && isRecentViewedExpanded && (
            <div className="mt-5">
              <HorizontalPostingList postings={data.recentViewedPostings} />
            </div>
          )}
          {data && data.recentViewedPostings.length === 0 && (
            <div
              className={
                isRecentViewedExpanded
                  ? 'flex h-[288px] flex-col items-center justify-center text-center'
                  : 'flex h-[117px] flex-col items-center justify-center text-center'
              }
            >
              {isRecentViewedExpanded && (
                <img
                  src={emptyRecentViewedIcon}
                  alt=""
                  aria-hidden="true"
                  className="mb-2 h-[84px] w-[104px] object-contain"
                />
              )}
              <p className="text-[18px] font-semibold leading-[28px] text-[#737373]">
                아직 조회한 공고가 없어요.
              </p>
              <p className="max-w-[300px] text-[18px] font-semibold leading-[28px] text-[#737373]">
                관심 있는 공고를 둘러보면 여기에 모아드릴게요!
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader title="마감 임박! 놓치지 마세요" onAction={() => navigate('/explore')} />
          <Tab tabs={deadlineTabs} active={activeDeadlineTab} onChange={setActiveDeadlineTab} />
          {isPending && <Skeleton variant="list" count={3} />}
          {data && deadlinePostings.length > 0 && <HorizontalPostingList postings={deadlinePostings} />}
          {data && deadlinePostings.length === 0 && (
            <EmptyState
              message="마감 임박 공고가 없어요."
              subMessage="저장 수가 높은 공고를 먼저 추천해드릴게요."
            />
          )}
        </section>
      </div>
    </Layout>
  );
}
