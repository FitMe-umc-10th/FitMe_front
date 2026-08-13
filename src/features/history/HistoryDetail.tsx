import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getHistoryDetail, updateHistoryMemo } from '@/apis/history';
import organizationIcon from '@/assets/icons/organization.svg';
import { Layout } from '@/shared/components';
import { copyTextToClipboard } from '@/shared/utils/clipboard';
import { formatKoreanDate } from '@/shared/utils/date';
import { useToastStore } from '@/store/toastStore';
import type { UserApplicationDetail } from '@/types/history';

type DetailTabType = 'PERIOD' | 'BENEFITS' | 'ELIGIBILITY';
type DetailRow = { label: string; value?: string };

const DETAIL_TABS = [
  { label: '접수 기간', value: 'PERIOD' },
  { label: '활동 혜택', value: 'BENEFITS' },
  { label: '지원 자격', value: 'ELIGIBILITY' },
] as const;

function DetailRows({ rows }: { rows: DetailRow[] }) {
  return (
    <dl className="flex w-full flex-col gap-2 pl-5 pr-5 [font-family:Pretendard]">
      {rows.map((row) => (
        <div key={row.label} className="flex min-w-0 flex-col items-start gap-2">
          <dt className="text-[14px] font-semibold leading-5 text-[#5184F9]">{row.label}</dt>
          <dd className="w-full whitespace-pre-wrap break-words text-[14px] font-medium leading-[17px] text-[#262626]">
            {row.value || '정보가 없습니다.'}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const historyId = Number(id);
  const [activeTab, setActiveTab] = useState<DetailTabType>('PERIOD');
  const [memoText, setMemoText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: historyItem, isLoading, isError } = useQuery<UserApplicationDetail>({
    queryKey: ['historyDetail', historyId],
    queryFn: () => getHistoryDetail(historyId),
    enabled: !Number.isNaN(historyId),
  });

  useEffect(() => {
    if (historyItem) setMemoText(historyItem.memo || '');
  }, [historyItem]);

  const updateMemoMutation = useMutation({
    mutationFn: (newMemo: string) => updateHistoryMemo(historyId, newMemo),
    onMutate: () => setIsSaving(true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['historyDetail', historyId] });
      void queryClient.invalidateQueries({ queryKey: ['historyList'] });
      setIsSaving(false);
      showToast('메모가 자동으로 저장되었습니다.', 'success');
    },
    onError: () => {
      setIsSaving(false);
      showToast('메모 저장에 실패했습니다.', 'error');
    },
  });

  const handleMemoBlur = () => {
    if (historyItem && memoText !== (historyItem.memo || '')) updateMemoMutation.mutate(memoText);
  };

  const handleShare = async () => {
    if (!historyItem) return;

    const applicationUrl = historyItem.post.applyUrl || historyItem.post.applicationUrl;
    if (!applicationUrl) {
      showToast('지원 링크를 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      await copyTextToClipboard(applicationUrl);
      showToast('공고 URL이 클립보드에 복사되었습니다', 'success');
    } catch {
      showToast('공고 URL 복사에 실패했습니다.', 'error');
    }
  };

  const detailHeader = (
    <header className="sticky top-0 z-30 mx-auto flex h-[67px] w-full max-w-[402px] items-center justify-center bg-white pb-[14px] pt-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
        className="absolute left-0 top-3 flex h-[41px] w-[45px] items-center justify-center rounded-full pl-1 transition-colors hover:bg-gray-100"
      >
        <svg viewBox="0 0 41 41" aria-hidden="true" className="size-[41px]">
          <path
            d="M26.125 11.7734L15.875 20.9984L26.125 30.2234"
            fill="none"
            stroke="#404040"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.05"
          />
        </svg>
      </button>
      <h1 className="h-7 text-center text-[20px] font-semibold leading-[140%] text-[#000B24]">이력 상세</h1>
      <button
        type="button"
        onClick={() => void handleShare()}
        aria-label="공유하기"
        className="absolute right-4 top-[17px] flex size-[31px] items-center justify-center rounded-full text-[#262626] transition-colors hover:bg-gray-100"
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

  if (isLoading) {
    return <Layout header={detailHeader}><div className="flex h-64 items-center justify-center"><div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div></Layout>;
  }

  if (isError || !historyItem) {
    return (
      <Layout header={detailHeader}>
        <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <p className="mb-4 font-semibold text-[#8C8C8C]">해당 이력 데이터를 불러올 수 없습니다.</p>
          <button type="button" onClick={() => navigate('/history')} className="rounded-lg bg-[#0059FF] px-6 py-2 text-sm font-semibold text-white">이력 목록으로 돌아가기</button>
        </div>
      </Layout>
    );
  }

  const post = historyItem.post;
  const scholarship = post.scholarship;
  const posterUrl = post.posterUrl;
  const periodRows: DetailRow[] = [
    {
      label: '일시',
      value: post.applyStartAt && post.applyEndAt
        ? `${formatKoreanDate(post.applyStartAt)} ~ ${formatKoreanDate(post.applyEndAt)}`
        : undefined,
    },
    { label: '접수 방법', value: post.applicationMethod },
  ];
  const benefitRows: DetailRow[] = post.benefit
    ? [
        { label: '대상', value: post.benefit.target },
        { label: '최우수상', value: post.benefit.grandPrize },
        { label: '입상자 전원', value: post.benefit.support },
      ]
    : [{ label: '지원 혜택', value: scholarship?.supportAmount }];
  const eligibilityRows: DetailRow[] = post.eligibility
    ? [
        { label: '학력', value: post.eligibility.education },
        { label: '인원 규모', value: post.eligibility.headcount },
      ]
    : [
        { label: '학력', value: scholarship?.gradeRequirement },
        { label: '소득', value: scholarship?.incomeRequirement },
        { label: '지역', value: scholarship?.regionRequirement },
      ];

  const activeRows = activeTab === 'PERIOD' ? periodRows : activeTab === 'BENEFITS' ? benefitRows : eligibilityRows;

  return (
    <Layout header={detailHeader}>
      <div className="flex w-full flex-col bg-white pb-8">
        <div className="h-[226px] w-full overflow-hidden bg-[#F2F2F2]">
          {posterUrl ? (
            <img src={posterUrl} alt={post.title} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-[#A5A5A5]">포스터 이미지가 없습니다.</div>
          )}
        </div>

        <section className="flex flex-col gap-5 border-b-[0.5px] border-[#D9D9D9] py-6">
          <div className="px-5">
            <h2 className="break-words text-[20px] font-semibold leading-[140%] text-[#000B24]">{post.title}</h2>
            <div className="mt-2 flex min-h-[19px] items-center justify-between">
              <div className="flex min-w-0 items-center gap-1 text-[10px] font-medium leading-[160%] text-[#8C8C8C]">
                <img src={organizationIcon} alt="" aria-hidden="true" className="size-[12px] shrink-0 opacity-80" />
                <span className="truncate">{post.organization || post.organizer || '기관 정보 없음'}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[12px] font-medium leading-[160%] text-[#8C8C8C]">
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="size-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  {post.viewCount ?? post.views ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="size-4"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
                  {post.savedCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex h-[38px] w-full items-center justify-between border-b-[0.5px] border-[#D9D9D9] px-5">
            {DETAIL_TABS.map((tab) => {
              const isActive = tab.value === activeTab;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative flex h-[38px] w-[79px] shrink-0 items-center justify-center whitespace-nowrap px-2 text-[16px] leading-[140%] ${isActive ? 'font-semibold text-[#1E1E1E]' : 'font-medium text-[#A5A5A5]'}`}
                >
                  {tab.label}
                  {isActive && <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#0059FF]" />}
                </button>
              );
            })}
          </div>

          <DetailRows rows={activeRows} />
        </section>

        <section className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold leading-[140%] text-[#1E1E1E]">나의 메모</h3>
            {isSaving && <span className="text-[10px] font-medium text-[#5184F9]">자동 저장 중...</span>}
          </div>
          <textarea
            value={memoText}
            onChange={(event) => setMemoText(event.target.value)}
            onBlur={handleMemoBlur}
            placeholder="탭하여 메모를 남겨보세요"
            className="mt-2 min-h-[120px] w-full resize-none border-0 p-0 text-[14px] font-normal leading-[140%] text-[#404040] outline-none placeholder:text-[#A5A5A5]"
          />
        </section>
      </div>
    </Layout>
  );
}
