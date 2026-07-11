import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUnreadNotificationCount } from '@/apis/notification';
import { getHomePostingFeed } from '@/apis/posting';
import Carousel from '@/shared/components/Carousel';
import EmptyState from '@/shared/components/EmptyState';
import PostingCard from '@/shared/components/PostingCard';
import Skeleton from '@/shared/components/Skeleton';
import { Header, Layout, Tab, TabBar } from '@/shared/components';
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
      <h2 className="text-[17px] font-bold leading-snug text-slate-900">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
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
      className="relative flex size-9 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-100"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path
          d="M6 17H18L16.8 15.4V11C16.8 8.2 15 6 12 6C9 6 7.2 8.2 7.2 11V15.4L6 17Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M10 18C10.4 19.2 11 20 12 20C13 20 13.6 19.2 14 18"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
      {hasUnreadNotification && <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />}
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeDeadlineTab, setActiveDeadlineTab] = useState<PostingType>('SCHOLARSHIP');

  const { data, isPending, isError } = useQuery({
    queryKey: ['homePostingFeed'],
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
          title="FitMe."
          rightSlot={<NotificationButton hasUnreadNotification={unreadNotificationCount > 0} />}
        />
      }
      tabBar={<TabBar />}
      className="bg-white"
    >
      <div className="space-y-8 px-5 pb-6 pt-6">
        <section className="space-y-3">
          <SectionHeader title="실시간 인기 공고" />
          {isPending && <Skeleton variant="popular" count={2} />}
          {isError && (
            <p className="rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
              인기 공고를 불러오지 못했어요.
            </p>
          )}
          {data && (
            <Carousel showIndicator loop>
              {data.popularPostings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} variant="popular" />
              ))}
            </Carousel>
          )}
        </section>

        <section className="-mx-5 space-y-4 bg-blue-50 px-5 py-5">
          <SectionHeader title="현수님의 최근 조회 목록" onAction={() => navigate('/recent-postings')} />
          {isPending && <Skeleton variant="card" count={2} />}
          {data && data.recentViewedPostings.length > 0 && (
            <Carousel>
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
