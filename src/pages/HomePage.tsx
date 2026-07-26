import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUnreadNotificationCount } from '@/apis/notification';
import { getHomePostingFeed } from '@/apis/posting';
import { postingQueryKeys } from '@/apis/postingQueryKeys';
import notificationBellIcon from '@/assets/icons/notification-bell.svg';
import Carousel from '@/shared/components/Carousel';
import EmptyState from '@/shared/components/EmptyState';
import PostingCard from '@/shared/components/PostingCard';
import Skeleton from '@/shared/components/Skeleton';
import { ErrorState, Header, Layout, Logo, Tab, TabBar } from '@/shared/components';
import type { PostingType } from '@/types/posting';

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
    <div className="flex items-center justify-between gap-3">
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
      {hasUnreadNotification && <span className="absolute right-[3px] top-[3px] size-2 rounded-full bg-[#FF2F2F]" />}
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeDeadlineTab, setActiveDeadlineTab] = useState<PostingType>('SCHOLARSHIP');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: postingQueryKeys.home,
    queryFn: getHomePostingFeed,
  });
  const { data: unreadNotificationCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: getUnreadNotificationCount,
  });

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
            <Carousel showIndicator showProgress loop storageKey="home-popular-carousel-index">
              {data.popularPostings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} variant="popular" />
              ))}
            </Carousel>
          )}
        </section>

        <section className="-mx-5 space-y-4 bg-[#EEF6FF] px-5 py-5">
          <SectionHeader title="현수님의 최근 조회 목록" onAction={() => navigate('/recent-postings')} />
          {isPending && <Skeleton variant="card" count={2} />}
          {data && data.recentViewedPostings.length > 0 && (
            <Carousel storageKey="home-recent-carousel-index">
              {data.recentViewedPostings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} variant="vertical" />
              ))}
            </Carousel>
          )}
          {data && data.recentViewedPostings.length === 0 && (
            <EmptyState
              illustration="heart-plus"
              message="아직 조회한 공고가 없어요."
              subMessage="관심 있는 공고를 둘러보면 여기에 모아드릴게요!"
            />
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader title="마감 임박! 놓치지 마세요" onAction={() => navigate('/explore')} />
          <Tab tabs={deadlineTabs} active={activeDeadlineTab} onChange={setActiveDeadlineTab} />
          {isPending && <Skeleton variant="list" count={3} />}
          {data && deadlinePostings.length > 0 && (
            <div className="flex flex-col gap-3">
              {deadlinePostings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} variant="horizontal" />
              ))}
            </div>
          )}
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
