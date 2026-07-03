import { useQuery } from '@tanstack/react-query';
import { getPostings } from '@/apis/posting';
import PostingCard from '@/shared/components/PostingCard';
import Carousel from '@/shared/components/Carousel';

// 보일러플레이트 동작 확인용 예시 페이지.
export default function HomePage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['postings'],
    queryFn: getPostings,
  });

  if (isPending) return <div className="p-4">불러오는 중…</div>;
  if (isError) return <div className="p-4">에러가 발생했어요.</div>;

  return (
    <main className="mx-auto max-w-md p-4 space-y-6 bg-slate-50/50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">FitMe</h1>
        <p className="text-xs text-gray-400 mt-1">공통 Carousel 및 PostingCard 검증 화면</p>
      </div>

      {/* 섹션 1: 최근 조회 목록 (가로형 스와이프 - 캐러셀 연동) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">현수님의 최근 조회 목록</h2>
          <button className="text-sm text-slate-400 flex items-center gap-0.5 hover:text-slate-600 transition-colors cursor-pointer">
            <span>더보기</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
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

      {/* 섹션 2: 맞춤 추천 공고 (세로형 리스트) */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">맞춤 추천 공고</h2>
        <div className="flex flex-col gap-3">
          {data?.map((posting) => (
            <PostingCard key={posting.id} posting={posting} variant="horizontal" />
          ))}
        </div>
      </section>
    </main>
  );
}
