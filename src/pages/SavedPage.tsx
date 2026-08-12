import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSavedPostings } from '@/apis/posting';
import { postingQueryKeys } from '@/apis/postingQueryKeys';
import Dropdown from '@/shared/components/Dropdown';
import EmptyState from '@/shared/components/EmptyState';
import ErrorState from '@/shared/components/ErrorState';
import PostingCard from '@/shared/components/PostingCard';
import Skeleton from '@/shared/components/Skeleton';
import { Layout, Tab, TabBar } from '@/shared/components';
import type { GetSavedPostingsParams, PostingCategoryFilter, PostingSort } from '@/types/posting';

type SavedTab = PostingCategoryFilter;
type SavedSortType = PostingSort;

const savedTabs: { label: string; value: SavedTab }[] = [
  { label: '전체', value: 'ALL' },
  { label: '장학금', value: 'SCHOLARSHIP' },
  { label: '공모전', value: 'CONTEST' },
];

const savedSortOptions = [
  { label: '최근 저장순', value: 'RECENT' },
  { label: '마감 임박순', value: 'DEADLINE' },
];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<SavedTab>('ALL');
  const [sort, setSort] = useState<SavedSortType>('DEADLINE');
  const [isFailureToastOpen, setIsFailureToastOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
  const savedPostingsParams: GetSavedPostingsParams = {
    category: activeTab,
    sort,
  };
  const { data: savedPostings = [], isPending, isError, refetch } = useQuery({
    queryKey: postingQueryKeys.savedList(savedPostingsParams),
    queryFn: () => getSavedPostings(savedPostingsParams),
  });

  const isEmpty = !isPending && !isError && savedPostings.length === 0;

  return (
    <Layout tabBar={<TabBar />} className="bg-white">
      {isFailureToastOpen && <SavedFailureToast onClose={() => setIsFailureToastOpen(false)} />}

      <div className="bg-white pt-11">
        <div className="flex h-[91px] shrink-0 flex-col items-start gap-5">
          <header className="flex h-7 w-full items-center px-5">
            <h1 className="w-[35px] text-center text-[20px] font-semibold leading-[140%] text-[#000B24]">저장</h1>
          </header>

          <Tab tabs={savedTabs} active={activeTab} onChange={setActiveTab} variant="content" />
        </div>
      </div>

      {isPending && (
        <section className="px-5 pt-5">
          <Skeleton variant="list" count={4} />
        </section>
      )}

      {isError && (
        <section className="px-5 pt-5">
          <ErrorState
            message="저장한 공고를 불러오지 못했습니다."
            onRetry={() => {
              void refetch();
            }}
          />
        </section>
      )}

      {isEmpty && (
        <section className="flex min-h-[calc(100dvh-135px-80px)] items-center justify-center px-5 pb-16">
          <EmptyState
            illustration="heart-plus"
            message="아직 저장한 공고가 없어요"
            subMessage={'마음에 드는 공고에 좋아요를 누르면\n여기에서 모아볼 수 있어요.'}
            messageClassName="!text-[#262626]"
            subMessageClassName="!text-[#262626]"
          />
        </section>
      )}

      {!isPending && !isError && savedPostings.length > 0 && (
        <section className="px-5 pb-6 pt-4">
          <div className="mb-[13px] flex justify-start">
            <Dropdown
              options={savedSortOptions}
              value={sort}
              onChange={(value) => setSort(value as SavedSortType)}
              variant="bottomSheet"
            />
          </div>

          <div className="flex flex-col gap-[20px]">
            {savedPostings.map((posting) => (
              <PostingCard
                key={posting.id}
                posting={posting}
                variant="horizontal"
                showSaveErrorToast={false}
                onSaveFailure={() => setIsFailureToastOpen(true)}
              />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}

function SavedFailureToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timerId = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timerId);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="status"
      aria-live="polite"
      onClick={onClose}
    >
      <div
        className="flex h-[162px] w-full max-w-[362px] flex-col items-center justify-center rounded-[14px] bg-white px-6 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[18px] font-bold text-[#262626]">저장 해제에 실패했어요!</p>
        <p className="mt-3 text-[14px] font-medium text-[#8F8F8F]">네트워크를 확인해주세요.</p>
      </div>
    </div>
  );
}
