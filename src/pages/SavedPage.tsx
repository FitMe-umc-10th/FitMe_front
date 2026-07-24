import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSavedPostings } from '@/apis/posting';
import { postingQueryKeys } from '@/apis/postingQueryKeys';
import organizationIcon from '@/assets/icons/organization.svg';
import savedTabHeartIcon from '@/assets/icons/saved-tab-heart.svg';
import DayBadge from '@/shared/components/DayBadge';
import Dropdown from '@/shared/components/Dropdown';
import EmptyState from '@/shared/components/EmptyState';
import ErrorState from '@/shared/components/ErrorState';
import PostingThumbnail from '@/shared/components/PostingThumbnail';
import Skeleton from '@/shared/components/Skeleton';
import { Layout, Tab, TabBar } from '@/shared/components';
import { useToggleSave } from '@/shared/hooks/useToggleSave';
import type { Posting, PostingType } from '@/types/posting';

type SavedTab = PostingType | 'ALL';
type SavedSortType = 'recent' | 'deadline';

const savedTabs: { label: string; value: SavedTab }[] = [
  { label: '전체', value: 'ALL' },
  { label: '장학금', value: 'SCHOLARSHIP' },
  { label: '공모전', value: 'CONTEST' },
];

const savedSortOptions = [
  { label: '마감임박순', value: 'deadline' },
  { label: '최근 저장순', value: 'recent' },
];

const sortSavedPostings = (postings: Posting[], sort: SavedSortType) => {
  if (sort === 'deadline') {
    return [...postings].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  return [...postings].sort((a, b) => b.id - a.id);
};

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<SavedTab>('ALL');
  const [sort, setSort] = useState<SavedSortType>('deadline');
  const [isFailureToastOpen, setIsFailureToastOpen] = useState(false);
  const { data: savedPostings = [], isPending, isError, refetch } = useQuery({
    queryKey: postingQueryKeys.saved,
    queryFn: getSavedPostings,
  });

  const filteredPostings = useMemo(() => {
    const filtered =
      activeTab === 'ALL'
        ? savedPostings
        : savedPostings.filter((posting) => posting.type === activeTab);

    return sortSavedPostings(filtered, sort);
  }, [activeTab, savedPostings, sort]);

  const isEmpty = !isPending && !isError && filteredPostings.length === 0;

  return (
    <Layout tabBar={<TabBar />} className="bg-white">
      {isFailureToastOpen && <SavedFailureToast onClose={() => setIsFailureToastOpen(false)} />}

      <header className="flex h-14 shrink-0 items-center justify-center bg-white">
        <h1 className="text-[16px] font-bold text-[#262626]">저장</h1>
      </header>

      <div className="-mx-0">
        <Tab tabs={savedTabs} active={activeTab} onChange={setActiveTab} variant="content" />
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
        <section className="flex min-h-[calc(100dvh-56px-43px-80px)] items-center justify-center px-5 pb-16">
          <EmptyState
            illustration="heart-plus"
            message="아직 저장한 공고가 없어요"
            subMessage={'마음에 드는 공고에 좋아요를 누르면\n여기에서 모아볼 수 있어요.'}
            messageClassName="!text-[#262626]"
            subMessageClassName="!text-[#262626]"
          />
        </section>
      )}

      {!isPending && !isError && filteredPostings.length > 0 && (
        <section className="px-5 pb-6 pt-4">
          <div className="mb-[13px] flex justify-start">
            <Dropdown options={savedSortOptions} value={sort} onChange={(value) => setSort(value as SavedSortType)} />
          </div>

          <div className="flex flex-col gap-[20px]">
            {filteredPostings.map((posting) => (
              <SavedPostingCard
                key={posting.id}
                posting={posting}
                onSaveFailure={() => setIsFailureToastOpen(true)}
              />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}

function SavedPostingCard({
  posting,
  onSaveFailure,
}: {
  posting: Posting;
  onSaveFailure: () => void;
}) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/postings/${posting.id}`)}
      className="grid h-[128px] cursor-pointer grid-cols-[176px_187px] gap-0 bg-white"
    >
      <div className="h-[128px] overflow-hidden rounded-[16px] bg-[#E6EEF8]">
        <PostingThumbnail src={posting.posterUrl} alt={posting.title} />
      </div>

      <div className="relative h-[128px] w-[187px] min-w-0 bg-white px-3 py-5">
        <div className="absolute left-3 top-[22px]">
          <DayBadge deadline={posting.deadline} />
        </div>

        <div className="absolute right-3 top-[22px]">
          <SavedHeartButton postingId={posting.id} isSaved={posting.isSaved} onSaveFailure={onSaveFailure} />
        </div>

        <h2 className="absolute left-3 right-3 top-[67.14px] truncate text-[14px] font-bold leading-[19px] text-[#262626]">
          {posting.title}
        </h2>

        <div className="absolute left-3 right-3 top-[92.86px] flex items-center gap-[3px] text-[11px] font-medium leading-none text-[#A5A5A5]">
          <img src={organizationIcon} alt="" aria-hidden="true" className="size-[13px] shrink-0" />
          <span className="truncate">{posting.organization}</span>
        </div>
      </div>
    </article>
  );
}

function SavedHeartButton({
  postingId,
  isSaved,
  onSaveFailure,
}: {
  postingId: number;
  isSaved: boolean;
  onSaveFailure: () => void;
}) {
  const { mutate, isPending } = useToggleSave(postingId, {
    showErrorToast: false,
    onError: onSaveFailure,
  });

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) return;
    mutate(isSaved);
  };

  return (
    <button
      type="button"
      aria-label={isSaved ? '저장 해제' : '저장'}
      disabled={isPending}
      onClick={handleClick}
      className="flex size-[14px] items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-50"
    >
      <img src={savedTabHeartIcon} alt="" aria-hidden="true" className="size-[14px]" />
    </button>
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
