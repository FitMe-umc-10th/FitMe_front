import { useQuery } from '@tanstack/react-query';
import { getPostings } from '@/apis/posting';
import PostingCard from '@/shared/components/PostingCard';
import Carousel from '@/shared/components/Carousel';
import { Header, Layout, TabBar } from '@/shared/components';

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['postings'],
    queryFn: getPostings,
  });

  return (
    <Layout
      header={
        <Header
          title="FitMe"
          rightSlot={
            <button
              type="button"
              aria-label="알림"
              className="relative flex size-9 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100"
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
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
            </button>
          }
        />
      }
      tabBar={<TabBar />}
      className="bg-gray-50"
    >
      <section className="space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">FitMe</h1>
          <p className="mt-1 text-xs text-gray-400">공고 추천 홈 화면</p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">현수님의 최근 조회 목록</h2>
            <button className="flex cursor-pointer items-center gap-0.5 text-sm text-slate-400 transition-colors hover:text-slate-600">
              <span>더보기</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <Carousel>
            {data?.map((posting) => (
              <PostingCard key={posting.id} posting={posting} variant="vertical" />
            ))}
          </Carousel>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">맞춤 추천 공고</h2>
          <div className="flex flex-col gap-3">
            {data?.map((posting) => (
              <PostingCard key={posting.id} posting={posting} variant="horizontal" />
            ))}
          </div>
        </section>
      </section>
    </Layout>
  );
}
