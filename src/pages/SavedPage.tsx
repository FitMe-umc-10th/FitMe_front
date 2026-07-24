import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSavedPostings } from '@/apis/posting';
import DayBadge from '@/shared/components/DayBadge';
import Dropdown from '@/shared/components/Dropdown';
import EmptyState from '@/shared/components/EmptyState';
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
  const { data: savedPostings = [], isPending, isError } = useQuery({
    queryKey: ['savedPostings'],
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

      <header className="flex h-[105px] shrink-0 items-end justify-center bg-white pb-[18px]">
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
          <p className="rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
            저장한 공고를 불러오지 못했어요.
          </p>
        </section>
      )}

      {isEmpty && (
        <section className="flex min-h-[540px] items-center justify-center px-5 pb-16">
          <EmptyState
            illustration="heart-wave"
            message="아직 저장한 공고가 없어요"
            subMessage={'마음에 드는 공고에 좋아요를 누르면\n여기에서 모아볼 수 있어요.'}
            messageClassName="!text-[#262626]"
            subMessageClassName="!text-[#262626]"
          />
        </section>
      )}

      {!isPending && !isError && filteredPostings.length > 0 && (
        <section className="px-5 pb-6 pt-4">
          <div className="mb-4 flex justify-start">
            <Dropdown options={savedSortOptions} value={sort} onChange={(value) => setSort(value as SavedSortType)} />
          </div>

          <div className="flex flex-col gap-5">
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
      className="grid h-[124px] cursor-pointer grid-cols-[174px_1fr] gap-3 bg-white"
    >
      <div className="h-[100px] overflow-hidden rounded-[10px] bg-[#E6EEF8]">
        <PostingThumbnail src={posting.posterUrl} alt={posting.title} />
      </div>

      <div className="relative flex min-w-0 flex-col pt-[18px]">
        <div className="absolute right-0 top-0">
          <SavedHeartButton postingId={posting.id} isSaved={posting.isSaved} onSaveFailure={onSaveFailure} />
        </div>

        <div className="mb-6">
          <DayBadge deadline={posting.deadline} />
        </div>

        <h2 className="line-clamp-2 min-h-[40px] pr-1 text-[14px] font-bold leading-[1.4] text-[#262626]">
          {posting.title}
        </h2>

        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#A5A5A5]">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6" />
          </svg>
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
      className="flex size-8 items-center justify-center rounded-full text-[#4A8DFF] transition-transform active:scale-90 disabled:opacity-50"
    >
      <svg viewBox="0 0 16 14" aria-hidden="true" className="h-[14px] w-4">
        <path
          d="M8.00503 14L1.2151 7.55146C-2.47508 3.68234 2.94949 -3.74638 8.00503 2.26366C13.0606 -3.74638 18.4605 3.70813 14.795 7.55146L8.00503 14Z"
          fill="currentColor"
        />
      </svg>
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
