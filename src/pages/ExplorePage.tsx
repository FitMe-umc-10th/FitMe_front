import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getSearchPosts } from '@/apis/explore';
import type { SearchPostItem, SearchNextCursor, SearchPostsResult } from '@/types/explore';
import type { Posting } from '@/types/posting';
import { Layout, Tab } from '@/shared/components';
import { TabBar } from '@/shared/components/TabBar';
import SearchBar from '@/shared/components/SearchBar';
import Dropdown from '@/shared/components/Dropdown';
import PostingCard from '@/shared/components/PostingCard';
import EmptyState from '@/shared/components/EmptyState';
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver';
import { getLiveSearchData, deleteSearchKeyword } from '@/apis/search';

interface RecentSearchItem {
  searchId?: number;
  keyword: string;
}

// 공모전 카테고리 정의 (Swagger Enum: PM, MARKETING, DESIGN, IT, VIDEO, LANGUAGE, ETC)
const CATEGORIES = ['마케팅', '기획/아이디어', '디자인', 'IT/개발', '어학', '영상편집', '기타'];

// 정렬 드롭다운 옵션
const SORT_OPTIONS = [
  { label: '마감 임박순', value: 'deadline' },
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'latest' },
];

const EXPLORE_TABS = [
  { label: '전체', value: 'all' },
  { label: '장학금', value: 'scholarship' },
  { label: '공모전', value: 'contest' },
] as const;

// 추천 테마 키워드 (피그마 시안 반영)
const RECOMMENDED_THEMES = ['고액장학금', '디자인공모전', '해외연수프로그램', '창업지원프로그램'];

const CATEGORY_MAP: Record<
  string,
  'PM' | 'MARKETING' | 'DESIGN' | 'IT' | 'VIDEO' | 'LANGUAGE' | 'ETC'
> = {
  마케팅: 'MARKETING',
  '기획/아이디어': 'PM',
  디자인: 'DESIGN',
  'IT/개발': 'IT',
  어학: 'LANGUAGE',
  영상편집: 'VIDEO',
  기타: 'ETC',
};

const mapSearchPostItemToPosting = (item: SearchPostItem): Posting => ({
  id: item.postId,
  type: item.type === 'CONTEST' ? 'CONTEST' : item.type === 'ETC' ? 'ETC' : 'SCHOLARSHIP',
  title: item.title,
  organization: item.organization,
  deadline: item.deadlineDate,
  posterUrl: item.thumbnailUrl,
  isSaved: item.saved,
  category: item.category ?? undefined,
});

export default function ExplorePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(''); // 입력창 텍스트
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색어 (디바운스 적용)
  const [isSearchFocused, setIsSearchFocused] = useState(false); // 검색창 포커스(오버레이 활성화) 여부
  const [activeTab, setActiveTab] = useState<'all' | 'scholarship' | 'contest'>('all'); // 대분류 탭
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined); // 공모전 카테고리 칩
  const [sortBy, setSortBy] = useState<'deadline' | 'latest' | 'popular'>('deadline'); // 정렬 방식
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]); // 최근 검색어 목록

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // 1. 실시간 검색 데이터 (최근 검색어 & 실시간 인기 공고 API 연동)
  const { data: liveSearchData } = useQuery({
    queryKey: ['liveSearchData'],
    queryFn: getLiveSearchData,
  });

  // API 데이터 기반 동적 추천 테마 및 실시간 기준 시간 구성
  const recommendedThemes = (() => {
    const dynamic: string[] = [];
    if (liveSearchData?.realtimePosts?.posts?.length) {
      liveSearchData.realtimePosts.posts.forEach((p) => {
        const firstWord = p.title.trim().split(/\s+/)[0];
        if (firstWord && firstWord.length >= 2 && !dynamic.includes(firstWord)) {
          dynamic.push(firstWord);
        }
      });
    }
    const merged = Array.from(new Set([...dynamic, ...RECOMMENDED_THEMES]));
    return merged.slice(0, 6);
  })();

  const displayBaseTime = (() => {
    const bt = liveSearchData?.realtimePosts?.baseTime;
    if (!bt) return '실시간 기준';
    if (bt.includes('T')) {
      const timeStr = bt.split('T')[1]?.substring(0, 5);
      if (timeStr) return `오늘 ${timeStr} 기준`;
    }
    return bt;
  })();

  const handleRealtimePostClick = (item: { postId: number; title: string }) => {
    if (item.postId) {
      navigate(`/postings/${item.postId}`);
    } else {
      handleSelectKeyword(item.title);
    }
  };

  // 최근 검색어 불러오기 (API 데이터 우선, 로컬스토리지 fallback)
  useEffect(() => {
    if (liveSearchData?.recentKeywords && liveSearchData.recentKeywords.length > 0) {
      setRecentSearches(
        liveSearchData.recentKeywords.map((item) => ({
          searchId: Number(item.searchId),
          keyword: item.keyword,
        })),
      );
    } else {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(
              parsed.map((item) =>
                typeof item === 'string' ? { keyword: item } : (item as RecentSearchItem),
              ),
            );
          }
        } catch (e) {
          console.error('Failed to load recent searches', e);
        }
      }
    }
  }, [liveSearchData]);

  // 검색 키워드 로컬 스토리지에 추가
  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.keyword !== trimmed);
      const updated = [{ keyword: trimmed }, ...filtered].slice(0, 10); // 최대 10개 관리
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  // 최근 검색어 개별 삭제 (API 호출 + 로컬 상태 삭제)
  const removeRecentSearch = async (item: RecentSearchItem) => {
    if (item.searchId) {
      try {
        await deleteSearchKeyword(item.searchId);
      } catch (e) {
        console.error('Failed to delete recent search keyword:', e);
      }
    }
    setRecentSearches((prev) => {
      const updated = prev.filter((kw) => kw.keyword !== item.keyword);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  // 추천 테마/인기검색어/최근검색어 클릭 시 검색 수행
  const handleSelectKeyword = (selected: string) => {
    setKeyword(selected);
    setSearchQuery(selected);
    setIsSearchFocused(false);
    saveRecentSearch(selected);
  };

  // 엔터 키 제출 또는 검색 버튼 클릭 시에만 실제 검색 실행
  const handleSubmitSearch = (val: string) => {
    const trimmed = val.trim();
    setSearchQuery(trimmed);
    setIsSearchFocused(false);
    if (trimmed) {
      saveRecentSearch(trimmed);
    }
  };

  // 검색 오버레이 닫기 및 검색 리셋
  const handleCancelSearch = () => {
    setKeyword('');
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // 무한 스크롤 커서 쿼리 구성 (GET /api/v1/posts API 연동)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [
        'searchPostsList',
        { keyword: searchQuery, type: activeTab, category: selectedCategory, sortBy },
      ],
      queryFn: ({ pageParam }: { pageParam?: SearchNextCursor }) =>
        getSearchPosts({
          type:
            activeTab === 'scholarship'
              ? 'SCHOLARSHIP'
              : activeTab === 'contest'
                ? 'CONTEST'
                : 'ALL',
          sort: sortBy === 'latest' ? 'RECENT' : 'DEADLINE',
          category:
            activeTab === 'contest' && selectedCategory
              ? CATEGORY_MAP[selectedCategory]
              : undefined,
          keyword: searchQuery.trim() || undefined,
          idCursor: pageParam?.idCursor,
          deadlineCursor: pageParam?.deadlineCursor,
        }),
      initialPageParam: undefined as SearchNextCursor | undefined,
      getNextPageParam: (lastPage: SearchPostsResult) => {
        if (!lastPage) return undefined;
        if (lastPage.hasNext) {
          if (lastPage.nextIdCursor !== undefined || lastPage.nextDeadlineCursor !== undefined) {
            return {
              idCursor: lastPage.nextIdCursor,
              deadlineCursor: lastPage.nextDeadlineCursor,
            };
          }
          if (lastPage.pageInfo?.nextCursor) {
            return lastPage.pageInfo.nextCursor;
          }
        }
        return undefined;
      },
    });

  // 무한 스크롤 트리거 관측용 커스텀 훅 연동
  const observerRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage && !isLoading && !isError,
  });

  // 무한 스크롤로 수집된 모든 SearchPostItem을 Posting형으로 평탄화 (Swagger data 우선)
  const rawPosts = data?.pages.flatMap((page) => page?.data ?? page?.posts ?? []) ?? [];
  const postings: Posting[] = rawPosts.map(mapSearchPostItemToPosting);

  return (
    <Layout
      header={
        <div
          className={`sticky top-0 z-20 flex flex-col bg-white transition-all ${
            isSearchFocused ? 'pt-[25px]' : 'border-b border-slate-100 pt-[37px]'
          }`}
        >
          {!isSearchFocused && (
            <header className="mb-5 flex h-7 w-full items-center px-5">
              <h1 className="w-[35px] text-center text-[20px] font-semibold leading-[140%] text-[#000B24]">
                탐색
              </h1>
            </header>
          )}

          {/* 상단 검색바 영역 (오버레이 활성화 시 뒤로가기 화살표가 왼쪽에 노출) */}
          <div
            className={`flex h-12 items-center ${
              isSearchFocused ? 'gap-2 px-2' : 'px-5'
            } ${isSearchFocused ? '' : 'mb-[7px]'}`}
          >
            {isSearchFocused && (
              <button
                type="button"
                onClick={handleCancelSearch}
                className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center text-[#404040]"
                aria-label="검색 취소"
              >
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M21.25 9.34961L12.75 16.9996L21.25 24.6496"
                    stroke="#404040"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <SearchBar
                value={keyword}
                onChange={(val) => {
                  setKeyword(val);
                  if (!val.trim()) {
                    setSearchQuery('');
                  }
                }}
                onSubmit={handleSubmitSearch}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="원하는 장학금, 공모전을 찾아보세요"
              />
            </div>
          </div>

          {!isSearchFocused && (
            <Tab
              tabs={[...EXPLORE_TABS]}
              active={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setSelectedCategory(undefined);
              }}
              variant="content"
            />
          )}
        </div>
      }
      tabBar={<TabBar />}
      className="bg-white flex flex-col min-h-[calc(100vh-128px)]"
    >
      {isSearchFocused ? (
        /* 검색창 포커스 시 노출할 피그마 규격 검색 오버레이 */
        <div className="flex-1 bg-white pt-[20px] pb-6 flex flex-col">
          {/* 최근 검색어 헤더 (왼쪽 20px 떨어져 있음) */}
          <div className="flex items-center px-5">
            <h4 className="font-semibold text-[16px] text-slate-800">최근 검색어</h4>
          </div>

          {/* 최근 검색어 분기 처리 (여부 스페이싱 규격 반영) */}
          {recentSearches.length > 0 ? (
            <div className="mt-[24px]">
              {/* 최근 검색어 가로 스크롤 동글이 */}
              <div className="scrollbar-none flex h-7 gap-2 overflow-x-auto px-5">
                {recentSearches.map((item) => (
                  <span
                    key={item.searchId ?? item.keyword}
                    className="inline-flex h-7 shrink-0 cursor-pointer select-none items-center gap-[4px] whitespace-nowrap rounded-[30px] border border-[#B2D4FF] px-3 py-1 text-[#67A6FF] transition-colors hover:bg-[#EFF6FF]"
                  >
                    <span
                      onClick={() => handleSelectKeyword(item.keyword)}
                      className="h-5 text-[14px] font-medium leading-[140%]"
                    >
                      {item.keyword}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRecentSearch(item)}
                      className="flex size-3.5 shrink-0 cursor-pointer items-center justify-center p-0 text-[#67A6FF]"
                      aria-label={`${item.keyword} 삭제`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              {/* 추천 테마 레이아웃 (최근 검색어 칩 하단 24px 거리에 배치) */}
              <div className="mt-6 flex min-h-[142px] flex-col gap-4 bg-[#EFF6FF] p-5">
                <h4 className="text-[16px] font-semibold leading-[140%] text-[#262626]">추천 테마</h4>
                <div className="flex flex-wrap gap-x-1 gap-y-2">
                  {recommendedThemes.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleSelectKeyword(theme)}
                      className="h-7 cursor-pointer select-none rounded-[100px] border border-[#91C1FF] px-3 py-1 text-center text-[14px] font-medium leading-[140%] text-[#67A6FF] transition-colors hover:bg-white"
                    >
                      #{theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-[32px]">
              {/* 최근 검색어 없음 문구 (타이틀 기준 32px 거리) */}
              <div className="text-center w-full px-[20px]">
                <p className="font-medium text-[14px] leading-[1.4] text-slate-400 text-center">
                  최근 검색어가 없습니다.
                </p>
              </div>

              {/* 추천 테마 레이아웃 (최근 검색어 없음 문구 하단 32px 거리에 배치) */}
              <div className="mt-8 flex min-h-[142px] flex-col gap-4 bg-[#EFF6FF] p-5">
                <h4 className="text-[16px] font-semibold leading-[140%] text-[#262626]">추천 테마</h4>
                <div className="flex flex-wrap gap-x-1 gap-y-2">
                  {recommendedThemes.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleSelectKeyword(theme)}
                      className="h-7 cursor-pointer select-none rounded-[100px] border border-[#91C1FF] px-3 py-1 text-center text-[14px] font-medium leading-[140%] text-[#67A6FF] transition-colors hover:bg-white"
                    >
                      #{theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 실시간 인기 공고 헤더 */}
          <div className="mt-6 flex h-[22px] items-center gap-2 px-5">
            <h4 className="text-[16px] font-semibold leading-[140%] text-[#262626]">실시간 인기 공고</h4>
            <span className="text-[12px] font-medium leading-[140%] text-[#A5A5A5]">
              {displayBaseTime}
            </span>
          </div>

          {/* 실시간 인기 공고 목록 (API 데이터 연동) */}
          <div className="mt-6 flex w-full flex-col gap-5 px-5">
            {liveSearchData?.realtimePosts?.posts?.map((item) => {
              return (
                <button
                  type="button"
                  key={item.postId || item.rank}
                  onClick={() => handleRealtimePostClick(item)}
                  className="group flex h-6 w-full cursor-pointer items-center text-left"
                >
                  <span
                    className={`w-[11px] shrink-0 text-center text-[16px] font-semibold leading-[150%] tracking-[-0.02em] ${
                      item.rank <= 3 ? 'text-[#247BFF]' : 'text-[#595959]'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className="ml-7 min-w-0 flex-1 truncate pr-3 text-[16px] font-normal leading-[140%] tracking-[-0.02em] text-[#272727] transition-colors group-hover:text-[#247BFF]">
                    {item.title}
                  </span>

                  {/* 순위 변동 표시 (UP/DOWN/NEW/SAME/STAY) */}
                  <span className="flex size-[23px] shrink-0 items-center justify-center">
                    {(() => {
                      const fl = item.fluctuation?.toString().trim().toUpperCase();
                      if (fl === 'UP' || fl === 'RISE') {
                        return (
                          <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true">
                            <path d="M5 1L9 7H1L5 1Z" fill="#247BFF" stroke="#5184F9" strokeWidth="1.2" />
                          </svg>
                        );
                      }
                      if (fl === 'DOWN' || fl === 'FALL') {
                        return (
                          <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true">
                            <path d="M5 7L1 1H9L5 7Z" fill="#F95178" stroke="#F95178" strokeWidth="1.2" />
                          </svg>
                        );
                      }
                      if (fl === 'NEW') {
                        return <span className="text-[9px] font-semibold leading-none text-[#F95178]">NEW</span>;
                      }
                      return <span className="h-0 w-[11px] border-t-[1.5px] border-[#B9B9B9]" />;
                    })()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* 일반 리스트 렌더링 화면 */
        <div className="flex flex-col flex-1 pb-4">
          {/* 공모전 탭 선택 시 노출할 분야 세부 카테고리 칩 스크롤 (메뉴와 24px 거리, 칩 간 11.5px 간격, 아래와 20px 격리) */}
          {activeTab === 'contest' && (
            <div className="scrollbar-none sticky top-[135px] z-10 mt-6 flex h-9 items-center gap-[5px] overflow-x-auto bg-white px-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setSelectedCategory((current) => (current === cat ? undefined : cat))
                  }
                  className={`h-9 shrink-0 rounded-[100px] px-3 text-[14px] leading-[140%] ${
                    selectedCategory === cat
                      ? 'bg-[#0059FF] font-medium text-white'
                      : 'border border-[#D9D9D9] font-normal tracking-[-0.244565px] text-[#8C8C8C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* 정렬 드롭다운 배치 (칩이 있을 경우 pt-0, 없을 경우 pt-[16px]) */}
          <div className={`flex items-center px-5 ${activeTab === 'contest' ? 'pt-5' : 'pt-4'}`}>
            <Dropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as 'deadline' | 'latest' | 'popular')}
              variant="bottomSheet"
            />
          </div>

          {/* 로딩 / 에러 / 빈 상태 / 결과 리스트 */}
          {isLoading && postings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-xs text-slate-400">공고를 불러오고 있어요...</span>
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <span className="text-slate-400 text-sm">에러가 발생했습니다.</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-xs"
              >
                다시 시도
              </button>
            </div>
          ) : postings.length === 0 ? (
            /* 매칭되는 리스트가 없을 시 EmptyState 노출 (탭 레이아웃 기준 133px 밑에 위치하도록 pt-[133px] 설정) */
            <div className="flex-1 bg-white pt-[133px] pb-16 flex flex-col items-center justify-start">
              <EmptyState message="조건에 맞는 공고가 없어요" illustration="heart-plus" />
            </div>
          ) : (
            /* 정렬 드롭다운 기준 16px 밑에 카드 배치, 카드 간 16px 마진 적용 */
            <div className="px-[20px] mt-[16px] space-y-[16px]">
              {postings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} variant="horizontal" />
              ))}

              {/* 무한 스크롤 하단 관측 지점 */}
              <div ref={observerRef} className="h-14 flex items-center justify-center pt-4">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>더 가져오고 있어요...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
