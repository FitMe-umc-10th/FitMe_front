import { useLayoutEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeadlinePostings } from '@/apis/posting';
import EmptyState from '@/shared/components/EmptyState';
import PostingCard from '@/shared/components/PostingCard';
import Skeleton from '@/shared/components/Skeleton';
import { Header, Layout, Tab, TabBar } from '@/shared/components';
import type { PostingType } from '@/types/posting';

const tabs: { label: string; value: PostingType | 'ALL' }[] = [
  { label: '전체', value: 'ALL' },
  { label: '장학금', value: 'SCHOLARSHIP' },
  { label: '공모전', value: 'CONTEST' },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PostingType | 'ALL'>('ALL');
  const { data, isPending, isError } = useQuery({
    queryKey: ['deadlinePostings'],
    queryFn: getDeadlinePostings,
  });

  const filteredPostings =
    data?.filter((posting) => activeTab === 'ALL' || posting.type === activeTab) ?? [];

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <Layout header={<Header title="탐색" />} tabBar={<TabBar />} className="bg-white">
      <section className="min-h-[calc(100dvh-120px)] px-5 py-5">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">마감 임박 공고</h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            마감일이 가까운 순서로 확인해보세요.
          </p>
        </div>

        <div className="-mx-5 mb-5">
          <Tab tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {isPending && <Skeleton variant="list" count={4} />}
        {isError && (
          <p className="rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
            탐색 공고를 불러오지 못했어요.
          </p>
        )}
        {data && filteredPostings.length === 0 && (
          <div className="rounded-2xl bg-blue-50 py-10">
            <EmptyState
              message="조건에 맞는 공고가 없어요."
              subMessage="다른 탭에서 공고를 확인해보세요."
            />
          </div>
        )}
        {filteredPostings.length > 0 && (
          <div className="flex flex-col gap-3">
            {filteredPostings.map((posting) => (
              <PostingCard key={posting.id} posting={posting} variant="horizontal" />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
