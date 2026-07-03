import { useQuery } from '@tanstack/react-query';
import { getPostings } from '@/apis/posting';
import PostingCard from '@/shared/components/PostingCard';

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
        <p className="text-xs text-gray-400 mt-1">공통 PostingCard 컴포넌트 동작 검증 화면</p>
      </div>

      {/* 섹션 1: 가로형 리스트 레이아웃 */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          맞춤 추천 공고 (가로형 리스트)
        </h2>
        <div className="flex flex-col gap-3">
          {data?.map((posting) => (
            <PostingCard
              key={posting.id}
              posting={posting}
              variant="horizontal"
            />
          ))}
        </div>
      </section>

      {/* 섹션 2: 세로형 캐러셀 레이아웃 */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          실시간 인기 공고 (세로형 카드)
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {data?.map((posting) => (
            <div key={posting.id} className="snap-start flex-shrink-0">
              <PostingCard
                posting={posting}
                variant="vertical"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
