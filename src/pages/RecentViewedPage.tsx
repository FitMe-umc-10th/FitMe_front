import { useQuery } from '@tanstack/react-query';
import { getRecentViewedPostings } from '@/apis/posting';
import EmptyState from '@/shared/components/EmptyState';
import ErrorState from '@/shared/components/ErrorState';
import PostingCard from '@/shared/components/PostingCard';
import Skeleton from '@/shared/components/Skeleton';
import { Header, Layout } from '@/shared/components';

export default function RecentViewedPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['recentViewedPostings'],
    queryFn: getRecentViewedPostings,
  });

  return (
    <Layout header={<Header title="최근 조회 목록" showBack />} className="bg-white">
      <section className="min-h-[calc(100dvh-56px)] px-5 py-5">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">현수님의 최근 조회 목록</h1>
          <p className="mt-1 text-sm font-medium text-slate-400">최근에 열어본 공고를 최신순으로 모았어요.</p>
        </div>

        {isPending && <Skeleton variant="list" count={4} />}
        {isError && (
          <ErrorState
            message="최근 조회 목록을 불러오지 못했습니다."
            onRetry={() => {
              void refetch();
            }}
          />
        )}
        {data && data.length === 0 && (
          <div className="rounded-2xl bg-blue-50 py-10">
            <EmptyState
              illustration="heart-plus"
              message="아직 조회한 공고가 없어요."
              subMessage="관심 있는 공고를 둘러보면 여기에 모아드릴게요!"
            />
          </div>
        )}
        {data && data.length > 0 && (
          <div className="flex flex-col gap-3">
            {data.map((posting) => (
              <PostingCard key={posting.id} posting={posting} variant="horizontal" />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
