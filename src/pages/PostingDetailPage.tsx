import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostingById } from '@/apis/posting';
import DayBadge from '@/shared/components/DayBadge';
import HeartButton from '@/shared/components/HeartButton';
import Skeleton from '@/shared/components/Skeleton';
import { Header, Layout } from '@/shared/components';

export default function PostingDetailPage() {
  const { postingId } = useParams();
  const parsedPostingId = Number(postingId);

  const { data, isPending, isError } = useQuery({
    queryKey: ['posting', parsedPostingId],
    queryFn: () => getPostingById(parsedPostingId),
    enabled: Number.isFinite(parsedPostingId),
  });

  return (
    <Layout header={<Header title="공고 상세" showBack />} className="bg-white">
      <section className="min-h-[calc(100dvh-56px)] px-5 py-5">
        {isPending && <Skeleton variant="list" count={2} />}
        {(isError || !Number.isFinite(parsedPostingId)) && (
          <p className="rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
            공고 정보를 불러오지 못했어요.
          </p>
        )}
        {data === null && (
          <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
            존재하지 않는 공고예요.
          </p>
        )}
        {data && (
          <article className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <img src={data.posterUrl} alt={data.title} className="h-[220px] w-full object-cover" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  {data.type === 'SCHOLARSHIP' ? '장학금' : '공모전'}
                </span>
                <DayBadge deadline={data.deadline} />
              </div>
              <h1 className="text-xl font-bold leading-snug text-slate-900">{data.title}</h1>
              <p className="text-sm font-medium text-slate-400">{data.organization}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-600">
                <HeartButton postingId={data.id} isSaved={data.isSaved} />
              </div>
              <button
                type="button"
                className="h-14 flex-1 rounded-2xl bg-blue-600 text-base font-bold text-white transition-colors hover:bg-blue-700"
              >
                홈페이지에서 지원하기
              </button>
            </div>
          </article>
        )}
      </section>
    </Layout>
  );
}
