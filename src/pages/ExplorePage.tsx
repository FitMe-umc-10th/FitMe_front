import { useLayoutEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPostings } from '@/apis/posting';
import Dropdown from '@/shared/components/Dropdown';
import EmptyState from '@/shared/components/EmptyState';
import PostingCard from '@/shared/components/PostingCard';
import SearchBar from '@/shared/components/SearchBar';
import Skeleton from '@/shared/components/Skeleton';
import { Layout, Tab, TabBar } from '@/shared/components';
import type { Posting, PostingType } from '@/types/posting';

const tabs: { label: string; value: PostingType | 'ALL' }[] = [
  { label: '전체', value: 'ALL' },
  { label: '장학금', value: 'SCHOLARSHIP' },
  { label: '공모전', value: 'CONTEST' },
];

const contestCategoryChips = ['마케팅', '기획/아이디어', '디자인', 'IT/개발', '어학', '영상 편집'];

const sortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '마감임박순', value: 'deadline' },
];

type SortType = 'latest' | 'deadline';
type RealtimePostingTrend = 'up' | 'down' | 'same';

const recentSearchStorageKey = 'fitme:recent-search-keywords';
const realtimePostingBaseHour = 22;

const recommendedThemes = [
  { label: '#고액장학금', keyword: '고액장학금' },
  { label: '#디자인공모전', keyword: '디자인공모전' },
  { label: '#해외연수프로그램', keyword: '해외연수프로그램' },
  { label: '#창업지원프로그램', keyword: '창업지원프로그램' },
];

const realtimePostings: { rank: number; title: string; trend: RealtimePostingTrend }[] = [
  { rank: 1, title: '국가장학금', trend: 'up' },
  { rank: 2, title: '마케팅 공모전', trend: 'same' },
  { rank: 3, title: '대학생 장학금', trend: 'down' },
  { rank: 4, title: 'IT 개발 공모전', trend: 'up' },
  { rank: 5, title: '디자인 공모전', trend: 'same' },
  { rank: 6, title: '영상 편집 공모전', trend: 'up' },
  { rank: 7, title: '어학 장학금', trend: 'down' },
  { rank: 8, title: '아이디어 공모전', trend: 'same' },
];

const getContestCategory = (posting: Posting) => {
  const categories = contestCategoryChips;
  return categories[posting.id % categories.length];
};

const sortPostings = (postings: Posting[], sort: SortType) => {
  if (sort === 'deadline') {
    return [...postings].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  return [...postings].sort((a, b) => b.id - a.id);
};

const readRecentSearches = () => {
  if (typeof window === 'undefined') return [];

  try {
    const storedSearches = window.localStorage.getItem(recentSearchStorageKey);
    if (!storedSearches) return [];

    const parsedSearches = JSON.parse(storedSearches);
    return Array.isArray(parsedSearches) ? parsedSearches.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeRecentSearches = (searches: string[]) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(recentSearchStorageKey, JSON.stringify(searches));
};

const getRealtimePostingBaseTimeLabel = () => `오늘 ${realtimePostingBaseHour}시 기준`;

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PostingType | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');
  const [overlayKeyword, setOverlayKeyword] = useState('');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isSearchResultMode, setIsSearchResultMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecentSearches);
  const [sort, setSort] = useState<SortType>('latest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data, isPending, isError } = useQuery({
    queryKey: ['postings'],
    queryFn: getPostings,
  });

  const filteredPostings = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const postings = data ?? [];

    const filtered = postings.filter((posting) => {
      const matchesTab = activeTab === 'ALL' || posting.type === activeTab;
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        posting.title.toLowerCase().includes(normalizedKeyword) ||
        posting.organization.toLowerCase().includes(normalizedKeyword);
      const matchesCategory =
        activeTab !== 'CONTEST' ||
        selectedCategories.length === 0 ||
        selectedCategories.includes(getContestCategory(posting));

      return matchesTab && matchesKeyword && matchesCategory;
    });

    return sortPostings(filtered, sort);
  }, [activeTab, data, keyword, selectedCategories, sort]);

  const handleTabChange = (tab: PostingType | 'ALL') => {
    setActiveTab(tab);
    setSelectedCategories([]);
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const handleOpenSearchOverlay = () => {
    setOverlayKeyword(keyword);
    setIsSearchResultMode(false);
    setIsSearchOverlayOpen(true);
  };

  const handleCloseSearchOverlay = () => {
    if (isSearchResultMode) {
      setOverlayKeyword('');
      setIsSearchResultMode(false);
      return;
    }

    setKeyword(overlayKeyword.trim());
    setIsSearchOverlayOpen(false);
  };

  const handleRemoveRecentSearch = (targetKeyword: string) => {
    setRecentSearches((currentSearches) => {
      const nextSearches = currentSearches.filter((search) => search !== targetKeyword);
      writeRecentSearches(nextSearches);
      return nextSearches;
    });
  };

  const handleSubmitSearch = (rawKeyword: string, shouldCloseOverlay = true) => {
    const nextKeyword = rawKeyword.trim();

    if (!nextKeyword) return;

    setKeyword(nextKeyword);
    setOverlayKeyword(nextKeyword);
    setRecentSearches((currentSearches) => {
      const nextSearches = [nextKeyword, ...currentSearches.filter((search) => search !== nextKeyword)].slice(0, 8);
      writeRecentSearches(nextSearches);
      return nextSearches;
    });
    setIsSearchResultMode(true);
    setIsSearchOverlayOpen(!shouldCloseOverlay);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <Layout tabBar={<TabBar />} className="bg-white">
      {isSearchOverlayOpen && (
        <SearchOverlay
          value={overlayKeyword}
          onChange={setOverlayKeyword}
          onClose={handleCloseSearchOverlay}
          onSearch={(search) => handleSubmitSearch(search, false)}
          onSubmitSearch={(search) => handleSubmitSearch(search, false)}
          searchKeyword={keyword}
          searchResults={filteredPostings}
          isSearchResultMode={isSearchResultMode}
          isPending={isPending}
          isError={isError}
          recentSearches={recentSearches}
          onRemoveRecentSearch={handleRemoveRecentSearch}
        />
      )}
      <section className="min-h-[calc(100dvh-80px)] px-5 pb-24 pt-5">
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          onFocus={handleOpenSearchOverlay}
          onSubmit={handleSubmitSearch}
          placeholder="원하는 장학금, 공모전을 찾아보세요"
        />

        <div className="-mx-5 mt-5">
          <Tab tabs={tabs} active={activeTab} onChange={handleTabChange} variant="content" />
        </div>

        {activeTab === 'CONTEST' && (
          <div className="mt-5 flex flex-wrap gap-2">
            {contestCategoryChips.map((category) => {
              const isSelected = selectedCategories.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleToggleCategory(category)}
                  className={`h-8 rounded-full px-4 text-[13px] font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#0059FF] text-white'
                      : 'border border-[#CECECE] bg-white text-[#4A4A4A]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex justify-start">
          <Dropdown options={sortOptions} value={sort} onChange={(value) => setSort(value as SortType)} />
        </div>

        {isPending && <Skeleton variant="list" count={4} />}
        {isError && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
            탐색 공고를 불러오지 못했어요.
          </p>
        )}
        {data && filteredPostings.length === 0 && (
          <div className="mt-10 bg-white py-10">
          <EmptyState
            illustration="heart-plus"
            message="조건에 맞는 공고가 없어요"
          />
        </div>
      )}
        {filteredPostings.length > 0 && (
          <div className={`mt-4 flex flex-col gap-3 ${activeTab === 'CONTEST' ? 'items-center' : ''}`}>
            {filteredPostings.map((posting) => (
              <PostingCard
                key={posting.id}
                posting={posting}
                variant={activeTab === 'CONTEST' ? 'popular' : 'horizontal'}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

interface SearchOverlayProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSearch: (keyword: string) => void;
  onSubmitSearch: (keyword: string) => void;
  searchKeyword: string;
  searchResults: Posting[];
  isSearchResultMode: boolean;
  isPending: boolean;
  isError: boolean;
  recentSearches: string[];
  onRemoveRecentSearch: (keyword: string) => void;
}

function SearchOverlay({
  value,
  onChange,
  onClose,
  onSearch,
  onSubmitSearch,
  searchKeyword,
  searchResults,
  isSearchResultMode,
  isPending,
  isError,
  recentSearches,
  onRemoveRecentSearch,
}: SearchOverlayProps) {
  const trimmedSearchKeyword = searchKeyword.trim();
  const isShowingSearchResults = isSearchResultMode && trimmedSearchKeyword.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="mx-auto min-h-dvh w-full max-w-[390px] bg-white pb-10">
        <div className="flex items-center gap-3 px-5 pt-5">
          <button
            type="button"
            aria-label="검색 닫기"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-start text-[#495057]"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
              <path
                d="M12.75 3.5L6.25 10L12.75 16.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <SearchBar
            value={value}
            onChange={onChange}
            onSubmit={onSubmitSearch}
            autoFocus
            placeholder="원하는 장학금, 공모전을 찾아보세요"
          />
        </div>

        {isShowingSearchResults ? (
          <SearchOverlayResults
            searchKeyword={trimmedSearchKeyword}
            searchResults={searchResults}
            isPending={isPending}
            isError={isError}
          />
        ) : (
          <SearchOverlaySuggestions
            recentSearches={recentSearches}
            onSearch={onSearch}
            onRemoveRecentSearch={onRemoveRecentSearch}
          />
        )}
      </div>
    </div>
  );
}

interface SearchOverlaySuggestionsProps {
  recentSearches: string[];
  onSearch: (keyword: string) => void;
  onRemoveRecentSearch: (keyword: string) => void;
}

function SearchOverlaySuggestions({
  recentSearches,
  onSearch,
  onRemoveRecentSearch,
}: SearchOverlaySuggestionsProps) {
  return (
    <>
      <section className="px-5 pt-7">
        <h2 className="text-[18px] font-bold text-[#262626]">최근 검색어</h2>

        {recentSearches.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <div
                key={search}
                className="inline-flex h-[33px] items-center overflow-hidden rounded-full bg-[#0059FF]/10 text-[13px] font-semibold text-[#0059FF]"
              >
                <button type="button" onClick={() => onSearch(search)} className="h-full pl-4 pr-2">
                  {search}
                </button>
                <button
                  type="button"
                  aria-label={`${search} 삭제`}
                  onClick={() => onRemoveRecentSearch(search)}
                  className="flex h-full w-8 items-center justify-center text-[#0059FF]"
                >
                  <svg viewBox="0 0 10 10" aria-hidden="true" className="size-[10px]">
                    <path
                      d="M1 1L9 9M9 1L1 9"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[14px] font-medium text-[#A5A5A5]">최근 검색어가 없습니다.</p>
        )}
      </section>

      <section className="-mx-5 mt-6 h-[138px] bg-[#EFF6FF] px-5 pt-5">
        <h2 className="text-[18px] font-bold leading-[22px] text-[#262626]">추천 테마</h2>
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
          {recommendedThemes.map((theme) => (
            <button
              key={theme.label}
              type="button"
              onClick={() => onSearch(theme.keyword)}
              className="h-[30px] rounded-[15px] border border-[#91C1FF] bg-transparent px-4 text-[15px] font-semibold leading-[30px] text-[#67A6FF]"
            >
              {theme.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <div className="flex h-[22px] items-center gap-[9px]">
          <h2 className="text-[18px] font-bold text-[#262626]">실시간 공고</h2>
          <span className="text-[12px] font-medium text-[#A5A5A5]">
            {getRealtimePostingBaseTimeLabel()}
          </span>
        </div>

        <ol className="mt-4 grid grid-cols-1 gap-3">
          {realtimePostings.map((item) => (
            <li key={item.rank}>
              <button
                type="button"
                onClick={() => onSearch(item.title)}
                className="flex h-8 w-full items-center gap-3 text-left"
              >
                <span className="w-5 text-[15px] font-bold text-[#0059FF]">{item.rank}</span>
                <span className="flex-1 text-[15px] font-semibold text-[#272727]">{item.title}</span>
                <TrendBadge trend={item.trend} />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

interface SearchOverlayResultsProps {
  searchKeyword: string;
  searchResults: Posting[];
  isPending: boolean;
  isError: boolean;
}

function SearchOverlayResults({
  searchKeyword,
  searchResults,
  isPending,
  isError,
}: SearchOverlayResultsProps) {
  return (
    <section className="px-5 pb-10 pt-6">
      <p className="text-[14px] font-semibold text-[#262626]">
        <span className="text-[#0059FF]">{searchKeyword}</span> 검색 결과
      </p>

      {isPending && <Skeleton variant="list" count={4} />}
      {isError && (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
          검색 결과를 불러오지 못했어요.
        </p>
      )}
      {!isPending && !isError && searchResults.length === 0 && (
        <div className="mt-10 bg-white py-10">
          <EmptyState
            illustration="heart-plus"
            message="조건에 맞는 공고가 없어요"
          />
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {searchResults.map((posting) => (
            <PostingCard key={posting.id} posting={posting} variant="horizontal" />
          ))}
        </div>
      )}
    </section>
  );
}

function TrendBadge({ trend }: { trend: RealtimePostingTrend }) {
  if (trend === 'up') {
    return <span className="text-[12px] font-bold text-[#FF5A36]">▲</span>;
  }

  if (trend === 'down') {
    return <span className="text-[12px] font-bold text-[#4A8DFF]">▼</span>;
  }

  return <span className="text-[12px] font-bold text-[#A5A5A5]">-</span>;
}
