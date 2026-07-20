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

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PostingType | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');
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

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <Layout tabBar={<TabBar />} className="bg-white">
      <section className="min-h-[calc(100dvh-80px)] px-5 pb-24 pt-5">
        <SearchBar value={keyword} onChange={setKeyword} placeholder="원하는 장학금, 공모전을 찾아보세요" />

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
          <div className="mt-10 rounded-2xl bg-[#F2F8FF] py-10">
            <EmptyState
              illustration="heart-plus"
              message="조건에 맞는 공고가 없어요"
              subMessage="검색어 또는 필터를 다시 확인해보세요."
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
