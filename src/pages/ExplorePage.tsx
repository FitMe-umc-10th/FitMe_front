import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getExplorePostings } from '@/apis/posting';
import { Layout } from '@/shared/components';
import { TabBar } from '@/shared/components/TabBar';
import SearchBar from '@/shared/components/SearchBar';
import Chip from '@/shared/components/Chip';
import Dropdown from '@/shared/components/Dropdown';
import PostingCard from '@/shared/components/PostingCard';
import EmptyState from '@/shared/components/EmptyState';
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver';
import { getLiveSearchData } from '@/apis/search';

// 공모전 카테고리 정의
const CATEGORIES = ['전체', '마케팅', '기획/아이디어', '디자인', 'IT/개발', '어학', '기타'];

// 정렬 드롭다운 옵션
const SORT_OPTIONS = [
  { label: '마감 임박순', value: 'deadline' },
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
];

// 추천 테마 키워드 (피그마 시안 반영)
const RECOMMENDED_THEMES = ['고액장학금', '디자인공모전', '해외연수프로그램', '창업지원프로그램'];

export default function ExplorePage() {
  const [keyword, setKeyword] = useState(''); // 입력창 텍스트
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색어 (디바운스 적용)
  const [isSearchFocused, setIsSearchFocused] = useState(false); // 검색창 포커스(오버레이 활성화) 여부
  const [activeTab, setActiveTab] = useState<'all' | 'scholarship' | 'contest'>('all'); // 대분류 탭
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined); // 공모전 카테고리 칩
  const [sortBy, setSortBy] = useState<'deadline' | 'latest' | 'popular'>('deadline'); // 정렬 방식
  const [recentSearches, setRecentSearches] = useState<string[]>([]); // 최근 검색어 목록

  // 1. 실시간 검색 데이터 (최근 검색어 & 실시간 인기 공고 API 연동)
  const { data: liveSearchData } = useQuery({
    queryKey: ['liveSearchData'],
    queryFn: getLiveSearchData,
  });

  // 최근 검색어 불러오기 (API 데이터 우선, 로컬스토리지 fallback)
  useEffect(() => {
    if (liveSearchData?.recentKeywords && liveSearchData.recentKeywords.length > 0) {
      setRecentSearches(liveSearchData.recentKeywords.map((item) => item.keyword));
    } else {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
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
      const filtered = prev.filter((item) => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 10); // 최대 10개 관리
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  // 최근 검색어 개별 삭제
  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== query);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  // 최근 검색어 전체 삭제
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // 추천 테마/인기검색어/최근검색어 클릭 시 검색 수행
  const handleSelectKeyword = (selected: string) => {
    setKeyword(selected);
    setSearchQuery(selected);
    setIsSearchFocused(false);
    saveRecentSearch(selected);
  };

  // 검색바에서 디바운스된 검색어 전달받을 때 호출
  const handleSearch = (debouncedVal: string) => {
    setSearchQuery(debouncedVal);
    // 디바운스 완료 시 검색어가 있으면 최근 검색어에 자동 추가
    if (debouncedVal.trim() && isSearchFocused) {
      saveRecentSearch(debouncedVal);
    }
  };

  // 검색 오버레이 닫기 및 검색 리셋
  const handleCancelSearch = () => {
    setKeyword('');
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // 무한 스크롤 쿼리 구성
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [
        'postings',
        'explore',
        { keyword: searchQuery, type: activeTab, category: selectedCategory, sortBy },
      ],
      queryFn: ({ pageParam = 0 }) =>
        getExplorePostings({
          keyword: searchQuery,
          type: activeTab,
          category: activeTab === 'contest' ? selectedCategory : undefined,
          sortBy,
          page: pageParam,
          limit: 4, // 테스트 및 동작 검증을 위해 페이지당 4개씩 분할
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  // 무한 스크롤 트리거 관측용 커스텀 훅 연동
  const observerRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage && !isLoading && !isError,
  });

  // 무한 스크롤로 수집된 모든 postings 리스트 평탄화
  const postings = data?.pages.flatMap((page) => page.postings) ?? [];

  return (
    <Layout
      header={
        <div
          className={`sticky top-0 z-20 flex flex-col bg-white transition-all ${
            isSearchFocused ? 'pt-[25px]' : 'pt-[29px] border-b border-slate-100'
          }`}
        >
          {/* 상단 검색바 영역 (오버레이 활성화 시 뒤로가기 화살표가 왼쪽에 노출) */}
          <div className="flex items-center px-[20px] pb-[8px]">
            {isSearchFocused && (
              <button
                type="button"
                onClick={handleCancelSearch}
                className="shrink-0 w-[16px] h-[16px] flex items-center justify-center text-slate-800 mr-[15px] cursor-pointer"
                aria-label="검색 취소"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[16px] h-[16px]"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <SearchBar
                value={keyword}
                onChange={setKeyword}
                onSearch={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="원하는 장학금, 공모전을 찾아보세요"
              />
            </div>
          </div>

          {/* 피그마 규격 대분류 탭 (검색 오버레이가 비활성화일 때만 표시, height: 43px, left: 20px, gap: 10px, border-bottom: 0.5px) */}
          {!isSearchFocused && (
            <div className="w-full h-[43px] border-b-[0.5px] border-slate-200 flex items-center pl-[20px]">
              <div className="flex gap-[10px] w-[206px] h-full">
                {(['all', 'scholarship', 'contest'] as const).map((tabVal) => {
                  const labels = { all: '전체', scholarship: '장학금', contest: '공모전' };
                  const tabWidths = {
                    all: 'w-[52px]',
                    scholarship: 'w-[67px]',
                    contest: 'w-[67px]',
                  };
                  const isActive = activeTab === tabVal;
                  return (
                    <button
                      key={tabVal}
                      type="button"
                      onClick={() => {
                        setActiveTab(tabVal);
                        setSelectedCategory(undefined);
                      }}
                      className={`${tabWidths[tabVal]} h-[43px] py-[9px] px-[10px] flex items-center justify-center font-semibold text-[18px] leading-[1.4] text-center transition-all cursor-pointer ${
                        isActive
                          ? 'text-slate-900 border-b-2 border-blue-500'
                          : 'text-slate-300 border-b-2 border-transparent'
                      }`}
                    >
                      {labels[tabVal]}
                    </button>
                  );
                })}
              </div>
            </div>
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
          <div className="flex items-center justify-between px-[20px]">
            <h4 className="font-semibold text-[16px] text-slate-800">최근 검색어</h4>
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                전체 삭제
              </button>
            )}
          </div>

          {/* 최근 검색어 분기 처리 (여부 스페이싱 규격 반영) */}
          {recentSearches.length > 0 ? (
            <div className="mt-[24px]">
              {/* 최근 검색어 가로 스크롤 동글이 */}
              <div className="flex gap-[8px] px-[20px] overflow-x-auto scrollbar-none">
                {recentSearches.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-[4px] px-[12px] py-[8px] rounded-[30px] bg-blue-50 text-blue-500 text-[12px] font-medium leading-[1.4] h-[33px] hover:bg-blue-100 transition-colors cursor-pointer select-none whitespace-nowrap shrink-0"
                  >
                    <span onClick={() => handleSelectKeyword(kw)}>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeRecentSearch(kw)}
                      className="text-blue-400 hover:text-blue-600 flex items-center justify-center cursor-pointer w-[9.33px] h-[9.33px]"
                      aria-label={`${kw} 삭제`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-[9.33px] h-[9.33px]"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              {/* 추천 테마 레이아웃 (최근 검색어 칩 하단 24px 거리에 배치) */}
              <div className="mt-[24px] bg-[#F5F9FF] px-[20px] py-[16px] flex flex-col gap-[16px]">
                <h4 className="font-semibold text-[16px] text-slate-800">추천 테마</h4>
                <div className="flex flex-wrap gap-[8px]">
                  {RECOMMENDED_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleSelectKeyword(theme)}
                      className="h-[30px] min-w-[90px] rounded-[100px] border border-blue-200 bg-white px-[10px] py-[5px] text-[14px] font-medium leading-[1.4] text-center text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer select-none"
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
              <div className="mt-[32px] bg-[#F5F9FF] px-[20px] py-[16px] flex flex-col gap-[16px]">
                <h4 className="font-semibold text-[16px] text-slate-800">추천 테마</h4>
                <div className="flex flex-wrap gap-[8px]">
                  {RECOMMENDED_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleSelectKeyword(theme)}
                      className="h-[30px] min-w-[90px] rounded-[100px] border border-blue-200 bg-white px-[10px] py-[5px] text-[14px] font-medium leading-[1.4] text-center text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer select-none"
                    >
                      #{theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 실시간 공고 헤더 (추천 테마와 24px 거리 두고, 기준 표시와 8px 띄움) */}
          <div className="mt-[24px] flex items-baseline gap-[8px] px-[20px]">
            <h4 className="font-semibold text-[16px] leading-[1.4] text-slate-800">실시간 공고</h4>
            <span className="font-medium text-[12px] leading-[1.4] text-slate-400">
              {liveSearchData?.realtimePosts?.baseTime || '오늘 22시 기준'}
            </span>
          </div>

          {/* 실시간 인기 공고 목록 (API 데이터 연동) */}
          <div className="mt-[24px] flex flex-col gap-[20px] px-[20px] w-full">
            {liveSearchData?.realtimePosts?.posts?.map((item) => {
              return (
                <div
                  key={item.postId || item.rank}
                  onClick={() => handleSelectKeyword(item.title)}
                  className="flex items-center justify-between cursor-pointer group w-full"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {/* 순위 (1~3위 파란색) */}
                    <span
                      className={`font-semibold text-[14px] w-[16px] text-center mr-[28px] shrink-0 ${
                        item.rank <= 3 ? 'text-blue-500' : 'text-slate-400'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span className="font-medium text-[14px] text-slate-800 group-hover:text-blue-500 transition-colors truncate flex-1 pr-4">
                      {item.title}
                    </span>
                  </div>

                  {/* 순위 변동 표시 (UP/DOWN/NEW/STAY) */}
                  <div className="flex items-center justify-center w-[16px] h-[16px] shrink-0">
                    {item.fluctuation === 'UP' && (
                      <svg
                        width="8"
                        height="6"
                        viewBox="0 0 8 6"
                        className="text-blue-500 fill-current"
                      >
                        <polygon points="4,0 8,6 0,6" />
                      </svg>
                    )}
                    {item.fluctuation === 'DOWN' && (
                      <svg
                        width="8"
                        height="6"
                        viewBox="0 0 8 6"
                        className="text-red-500 fill-current"
                      >
                        <polygon points="4,6 8,0 0,0" />
                      </svg>
                    )}
                    {item.fluctuation === 'NEW' && (
                      <span className="text-[10px] font-bold text-red-500">NEW</span>
                    )}
                    {item.fluctuation === 'SAME' && (
                      <div className="w-[11px] h-[1.5px] bg-slate-300 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 일반 리스트 렌더링 화면 */
        <div className="flex flex-col flex-1 pb-4">
          {/* 공모전 탭 선택 시 노출할 분야 세부 카테고리 칩 스크롤 (메뉴와 24px 거리, 칩 간 11.5px 간격, 아래와 20px 격리) */}
          {activeTab === 'contest' && (
            <div className="flex items-center gap-[11.5px] overflow-x-auto bg-white pl-[20px] pr-[20px] pt-[24px] pb-[20px] border-b border-slate-100 scrollbar-none sticky top-[108px] z-10">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="shrink-0">
                  <Chip
                    label={cat}
                    selected={
                      cat === '전체' ? selectedCategory === undefined : selectedCategory === cat
                    }
                    onToggle={() => setSelectedCategory(cat === '전체' ? undefined : cat)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 정렬 드롭다운 배치 (칩이 있을 경우 pt-0, 없을 경우 pt-[16px]) */}
          <div
            className={`flex items-center justify-between pl-[20px] pr-[20px] ${
              activeTab === 'contest' ? 'pt-0' : 'pt-[16px]'
            }`}
          >
            <Dropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as 'deadline' | 'latest' | 'popular')}
            />
            <span className="text-xs text-slate-400 font-semibold">
              {!isLoading && `총 ${data?.pages[0]?.total ?? 0}건`}
            </span>
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
