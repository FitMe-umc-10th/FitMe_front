import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostingById } from '@/apis/posting';
import DayBadge from '@/shared/components/DayBadge';
import Skeleton from '@/shared/components/Skeleton';
import { useToggleSave } from '@/shared/hooks/useToggleSave';
import { Layout } from '@/shared/components';
import type { Posting } from '@/types/posting';

const DETAIL_SUMMARY =
  '마케팅 분야에 높은 관심을 가지고 계신 학습님께 적합한 공모전입니다. 총 12개의 대기업이 제시한 실무 과제에 대해 마케팅 전략 및 아이디어를 제안해볼 수 있는 기회이고, 실제 기업의 비즈니스 과제를 분석하여 창의적인 마케팅 솔루션을 기획하는 경험을 쌓을 수 있습니다.';

const DETAIL_INFO = {
  period: {
    date: '2026. 05. 01. (월) ~ 2026. 05. 31. (수) 18시',
    method: '공식 홈페이지를 통한 온라인 접수',
  },
};

function formatCount(count?: number) {
  if (typeof count !== 'number') return '0';
  return count.toLocaleString('ko-KR');
}

function DetailHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-[56px] items-center justify-center bg-white px-4">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="absolute left-2 flex size-10 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-gray-100"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
          <path
            d="M15 5L8 12L15 19"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      <h1 className="text-[15px] font-extrabold text-[#111827]">공고 상세</h1>
      <button
        type="button"
        aria-label="공유하기"
        className="absolute right-3 flex size-10 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-gray-100"
      >
        <svg viewBox="0 0 31 31" aria-hidden="true" className="size-[31px]">
          <path
            d="M5.16602 21.0664V22.6561C5.16602 23.4994 5.501 24.3081 6.09727 24.9044C6.69354 25.5007 7.50225 25.8356 8.3455 25.8356H22.6532C23.4964 25.8356 24.3052 25.5007 24.9014 24.9044C25.4977 24.3081 25.8327 23.4994 25.8327 22.6561V21.0664"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.67917"
          />
          <path
            d="M10.7305 10.7321L15.4997 5.16797L20.2689 10.7321"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.67917"
          />
          <path
            d="M15.5 5.16797V19.4757"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.67917"
          />
        </svg>
      </button>
    </header>
  );
}

function OrganizationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 shrink-0">
      <path
        d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MetricIcon({ type }: { type: 'view' | 'heart' }) {
  if (type === 'view') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
        <path
          d="M14.2294 7.33C14.3952 7.51375 14.487 7.75248 14.487 8C14.487 8.24752 14.3952 8.48625 14.2294 8.67C13.1794 9.8 10.7894 12 7.99936 12C5.20936 12 2.81936 9.8 1.76936 8.67C1.60352 8.48625 1.51172 8.24752 1.51172 8C1.51172 7.75248 1.60352 7.51375 1.76936 7.33C2.81936 6.2 5.20936 4 7.99936 4C10.7894 4 13.1794 6.2 14.2294 7.33Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.866667"
        />
        <path
          d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.866667"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 14" aria-hidden="true" className="h-3.5 w-4">
      <path
        d="M8.0027 12.6654L3.47608 8.36634C1.01597 5.78692 4.63234 0.834445 8.0027 4.84114C11.3731 0.834445 14.973 5.80412 12.5293 8.36634L8.0027 12.6654Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.866667"
      />
    </svg>
  );
}

function TypeBadge({ posting }: { posting: Posting }) {
  return (
    <span className="inline-flex h-[24px] items-center justify-center rounded-full bg-[#EEF6FF] px-3 text-[11px] font-bold text-[#4C96FF]">
      {posting.type === 'SCHOLARSHIP' ? '장학금' : '공모전'}
    </span>
  );
}

function DetailSaveButton({ posting }: { posting: Posting }) {
  const { mutate, isPending } = useToggleSave(posting.id);
  const isSaved = posting.isSaved;

  const handleClick = () => {
    if (isPending) return;
    mutate(isSaved);
  };

  return (
    <button
      type="button"
      aria-label={isSaved ? '찜하기 해제' : '찜하기'}
      disabled={isPending}
      onClick={handleClick}
      className={`flex h-[61px] w-[61px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-white text-[10px] font-bold transition-all active:scale-95 disabled:opacity-60 ${
        isSaved ? 'border border-[#D9D9D9] text-[#0059FF]' : 'border-[1.5px] border-[#0059FF] text-[#0059FF]'
      }`}
    >
      <svg viewBox="17 8 28 28" aria-hidden="true" className="mb-1 h-[27.5px] w-[27.5px]">
        {isSaved ? (
          <path
            d="M30.5064 30.5221L22.7263 23.1332C18.498 18.6998 24.7136 10.1877 30.5064 17.0742C36.2992 10.1877 42.4867 18.7294 38.2865 23.1332L30.5064 30.5221Z"
            fill="#F95178"
          />
        ) : (
          <path
            d="M31.0057 28.375L23.367 21.1204C19.2155 16.7676 25.3182 8.41032 31.0057 15.1716C36.6931 8.41032 42.7681 16.7966 38.6443 21.1204L31.0057 28.375Z"
            fill="none"
            stroke="#0059FF"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4625"
          />
        )}
      </svg>
      <span>찜하기</span>
    </button>
  );
}

export default function PostingDetailPage() {
  const { postingId } = useParams();
  const parsedPostingId = Number(postingId);

  const { data, isPending, isError } = useQuery({
    queryKey: ['posting', parsedPostingId],
    queryFn: () => getPostingById(parsedPostingId),
    enabled: Number.isFinite(parsedPostingId),
  });

  return (
    <Layout header={<DetailHeader />} className="bg-white">
      <section className="min-h-[calc(100dvh-56px)] pb-[112px]">
        {isPending && <Skeleton variant="list" count={2} />}
        {(isError || !Number.isFinite(parsedPostingId)) && (
          <p className="mx-5 mt-5 rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
            공고 정보를 불러오지 못했어요.
          </p>
        )}
        {data === null && (
          <p className="mx-5 mt-5 rounded-2xl bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
            존재하지 않는 공고예요.
          </p>
        )}
        {data && (
          <article>
            <div className="h-[190px] w-full bg-[#E8EEF5]">
              <img src={data.posterUrl} alt={data.title} className="h-full w-full object-cover" />
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center gap-2">
                <TypeBadge posting={data} />
                <DayBadge deadline={data.deadline} />
              </div>

              <div className="space-y-2">
                <h2 className="text-[18px] font-extrabold leading-[1.45] text-[#202124]">{data.title}</h2>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1 text-[12px] font-medium text-[#A1A1A1]">
                    <OrganizationIcon />
                    <span className="truncate">{data.organization}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[12px] font-medium text-[#8C8C8C]">
                    <span className="flex items-center gap-1">
                      <MetricIcon type="view" />
                      {formatCount(data.viewCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MetricIcon type="heart" />
                      {formatCount(data.savedCount)}
                    </span>
                  </div>
                </div>
              </div>

              <section className="min-h-[116px] rounded-2xl border border-[#B2D4FF] bg-gradient-to-b from-[#E2EFFF] to-white px-4 py-4">
                <h3 className="mb-2 text-[13px] font-extrabold text-[#247BFF]">AI 공고전 정보 요약</h3>
                <p className="text-[12px] font-medium leading-[1.75] text-[#404040]">{DETAIL_SUMMARY}</p>
              </section>

              <section className="pt-1">
                <div className="grid grid-cols-3 border-b border-[#EEF0F3] text-center text-[14px] font-semibold">
                  <button type="button" className="relative h-11 text-[#0059FF]">
                    접수 기간
                    <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-[70%] rounded-full bg-[#0059FF]" />
                  </button>
                  <button type="button" className="h-11 text-[#A5A5A5]">활동 혜택</button>
                  <button type="button" className="h-11 text-[#A5A5A5]">지원 자격</button>
                </div>

                <dl className="space-y-3 py-5 text-[13px] leading-[1.6]">
                  <div className="grid grid-cols-[64px_1fr] gap-2">
                    <dt className="font-bold text-[#4C96FF]">일시</dt>
                    <dd className="font-semibold text-[#333333]">{DETAIL_INFO.period.date}</dd>
                  </div>
                  <div className="grid grid-cols-[64px_1fr] gap-2">
                    <dt className="font-bold text-[#4C96FF]">접수 방법</dt>
                    <dd className="font-semibold text-[#333333]">{DETAIL_INFO.period.method}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[390px] -translate-x-1/2 items-center gap-3 border-t border-[#EEF0F3] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3">
              <DetailSaveButton posting={data} />
              <button
                type="button"
                className="h-[61px] flex-1 rounded-[10px] bg-[#0059FF] text-[15px] font-extrabold text-white transition-colors hover:bg-[#004CE0]"
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
