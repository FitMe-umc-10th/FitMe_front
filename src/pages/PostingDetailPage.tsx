import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  completePostingApplication,
  getPostingById,
  startPostingApplication,
  type PostingApplicationResult,
} from '@/apis/posting';
import { postingQueryKeys } from '@/apis/postingQueryKeys';
import organizationIcon from '@/assets/icons/organization.svg';
import DayBadge from '@/shared/components/DayBadge';
import ErrorState from '@/shared/components/ErrorState';
import PostingThumbnail from '@/shared/components/PostingThumbnail';
import Skeleton from '@/shared/components/Skeleton';
import { useToggleSave } from '@/shared/hooks/useToggleSave';
import { Layout } from '@/shared/components';
import { useModalStore } from '@/store/modalStore';
import { useToastStore } from '@/store/toastStore';
import type { Posting } from '@/types/posting';

const DETAIL_SUMMARY =
  '마케팅 분야에 높은 관심을 가지고 계신 학습님께 적합한 공모전입니다. 총 12개의 대기업이 제시한 실무 과제에 대해 마케팅 전략 및 아이디어를 제안해볼 수 있는 기회이고, 실제 기업의 비즈니스 과제를 분석하여 창의적인 마케팅 솔루션을 기획하는 경험을 쌓을 수 있습니다.';

const DETAIL_INFO = {
  period: {
    date: '2026. 05. 01. (월) ~ 2026. 05. 31. (수) 18시',
    method: '공식 홈페이지를 통한 온라인 접수',
  },
  benefit: {
    target: '상금 500만원 및 상장',
    grandPrize: '상금 200만원 및 상장',
    support: '입상자 전원 CJ ENM 채용 서류전형 가점',
  },
  eligibility: {
    education: '전국 대학생 및 대학원생 (휴학생 포함)',
    headcount: '개인 또는 팀(4인 이하) 지원 가능',
  },
};

const DETAIL_TABS = [
  { label: '접수 기간', value: 'period' },
  { label: '활동 혜택', value: 'benefit' },
  { label: '지원 자격', value: 'eligibility' },
] as const;

type DetailTab = (typeof DETAIL_TABS)[number]['value'];
type DetailInfoRow = {
  label: string;
  value: string;
};

function formatCount(count?: number) {
  if (typeof count !== 'number') return '0';
  return count.toLocaleString('ko-KR');
}

function DetailHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 mx-auto flex h-[41px] w-full max-w-[402px] items-center justify-center bg-white">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="absolute left-0 flex h-[41px] w-[45px] items-center justify-center rounded-full pl-1 transition-colors hover:bg-gray-100"
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
      <h1 className="h-7 w-[74px] text-center text-[20px] font-semibold leading-[140%] text-[#000B24]">
        공고 상세
      </h1>
      <button
        type="button"
        aria-label="공유하기"
        className="absolute right-4 flex size-[31px] items-center justify-center rounded-full text-[#262626] transition-colors hover:bg-gray-100"
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
    <span className="inline-flex h-[27px] w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium leading-[160%] text-[#0059FF] [font-family:Pretendard]">
      {posting.type === 'SCHOLARSHIP' ? '장학금' : '공모전'}
    </span>
  );
}

function DetailInfoTabs({
  activeTab,
  onChange,
}: {
  activeTab: DetailTab;
  onChange: (tab: DetailTab) => void;
}) {
  return (
    <div className="flex h-[38px] w-full items-center gap-[62px] border-b border-[#D9D9D9] pl-5 text-center">
      {DETAIL_TABS.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex h-[38px] w-[79px] items-center justify-center border-b-[1.5px] px-0 py-2 text-center text-[16px] leading-[140%] [font-family:Pretendard] ${
              isActive
                ? 'border-[#0059FF] font-semibold text-[#1E1E1E]'
                : 'border-transparent font-medium text-[#A5A5A5]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function DetailInfoList({ rows }: { rows: DetailInfoRow[] }) {
  return (
    <dl className="flex min-h-[98px] w-full flex-col items-start gap-2 pl-5 [font-family:Pretendard]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex w-[calc(100%_-_20px)] flex-col items-start gap-0.5"
        >
          <dt className="text-[14px] font-semibold leading-[20px] text-[#5184F9]">
            {row.label}
          </dt>
          <dd className="w-full whitespace-pre-line break-words text-[14px] font-medium leading-[17px] text-[#262626]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DetailInfoContent({ activeTab, posting }: { activeTab: DetailTab; posting: Posting }) {
  const period = {
    date: posting.period?.date || DETAIL_INFO.period.date,
    method: posting.period?.method || DETAIL_INFO.period.method,
  };
  const benefit = {
    target: posting.benefit?.target || DETAIL_INFO.benefit.target,
    grandPrize: posting.benefit?.grandPrize || DETAIL_INFO.benefit.grandPrize,
    support: posting.benefit?.support || DETAIL_INFO.benefit.support,
  };
  const eligibility = {
    education: posting.eligibility?.education || DETAIL_INFO.eligibility.education,
    headcount: posting.eligibility?.headcount || DETAIL_INFO.eligibility.headcount,
  };

  if (activeTab === 'benefit') {
    return (
      <DetailInfoList
        rows={[
          { label: '대상', value: benefit.target },
          { label: '최우수상', value: benefit.grandPrize },
          { label: '입상자 전원', value: benefit.support },
        ]}
      />
    );
  }

  if (activeTab === 'eligibility') {
    return (
      <DetailInfoList
        rows={[
          { label: '학력', value: eligibility.education },
          { label: '인원 규모', value: eligibility.headcount },
        ]}
      />
    );
  }

  return (
    <DetailInfoList
      rows={[
        { label: '일시', value: period.date },
        { label: '접수 방법', value: period.method },
      ]}
    />
  );
}

function DetailUnavailableState({
  title,
  description,
  onGoHome,
}: {
  title: string;
  description: string;
  onGoHome: () => void;
}) {
  return (
    <div className="mx-5 mt-5 flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] px-6 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#EEF6FF] text-[#0059FF]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7">
          <path
            d="M9.5 9.5H9.51M14.5 9.5H14.51M8.5 15C9.45 14.2 10.55 13.8 12 13.8C13.45 13.8 14.55 14.2 15.5 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
      <h2 className="text-[17px] font-extrabold text-[#262626]">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-[13px] font-medium leading-[1.6] text-[#8F8F8F]">
        {description}
      </p>
      <button
        type="button"
        onClick={onGoHome}
        className="mt-6 h-11 rounded-[10px] bg-[#0059FF] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#004CE0]"
      >
        홈으로 가기
      </button>
    </div>
  );
}

function DetailSaveButton({ posting }: { posting: Posting }) {
  const { mutate, isPending } = useToggleSave(posting.id, { savedId: posting.savedId });
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
  const navigate = useNavigate();
  const parsedPostingId = Number(postingId);
  const isValidPostingId = Number.isFinite(parsedPostingId);
  const [activeTab, setActiveTab] = useState<DetailTab>('period');
  const [isWaitingForApplyReturn, setIsWaitingForApplyReturn] = useState(false);
  const [pendingApplication, setPendingApplication] = useState<PostingApplicationResult | null>(null);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const showToast = useToastStore((state) => state.showToast);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: postingQueryKeys.detail(parsedPostingId),
    queryFn: () => getPostingById(parsedPostingId),
    enabled: isValidPostingId,
  });

  const openApplyCompleteModal = useCallback((application: PostingApplicationResult) => {
    openModal({
      title: '지원을 완료하셨나요?',
      description: "완료 버튼을 누르시면, '이력' 탭 상태값이\n결과 대기 중으로 변경돼요.",
      buttons: [
        {
          label: '아직이에요',
          variant: 'secondary',
          onClick: () => {
            setPendingApplication(null);
            openModal({
              title: '꼭 이력을 관리 해주세요!',
              description: "이력 탭에 '-' 상태로 추가되었습니다.\n상태 변경 및 삭제는 이력 탭에서 진행해주세요.",
              buttons: [{ label: '확인', variant: 'primary', onClick: closeModal }],
            });
          },
        },
        {
          label: '완료했어요',
          variant: 'primary',
          onClick: async () => {
            try {
              await completePostingApplication(application.userApplicationId);
              setPendingApplication(null);
              showToast('지원 상태가 결과 대기 중으로 변경됐어요.', 'success');
            } catch {
              showToast('지원 상태 변경에 실패했어요.', 'error');
            }
            closeModal();
          },
        },
      ],
    });
  }, [closeModal, openModal, showToast]);

  const handleApplyClick = (posting: Posting) => {
    openModal({
      title: '공식 홈페이지로 이동하시겠어요?',
      description: "지원을 완료하신 후, 핏미에 돌아와\n진행 상태를 꼭 '지원 완료'로 변경해주세요!",
      buttons: [
        {
          label: '취소',
          variant: 'secondary',
          onClick: closeModal,
        },
        {
          label: '이동하기',
          variant: 'primary',
          onClick: async () => {
            try {
              const application = await startPostingApplication(posting.id);
              const applyUrl = application.applicationUrl || posting.applyUrl;

              if (!applyUrl) {
                showToast('지원 링크를 찾을 수 없습니다.', 'error');
                closeModal();
                return;
              }

              setPendingApplication(application);
              setIsWaitingForApplyReturn(true);
              window.open(applyUrl, '_blank', 'noopener,noreferrer');
            } catch {
              showToast('지원 이력 생성에 실패했어요.', 'error');
            }
            closeModal();
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (!isWaitingForApplyReturn || !pendingApplication) return;

    const handleReturnToApp = () => {
      if (document.visibilityState === 'hidden') return;

      setIsWaitingForApplyReturn(false);
      openApplyCompleteModal(pendingApplication);
    };

    window.addEventListener('focus', handleReturnToApp);
    document.addEventListener('visibilitychange', handleReturnToApp);

    return () => {
      window.removeEventListener('focus', handleReturnToApp);
      document.removeEventListener('visibilitychange', handleReturnToApp);
    };
  }, [isWaitingForApplyReturn, openApplyCompleteModal, pendingApplication]);

  return (
    <Layout header={<DetailHeader />} className="bg-white">
      <section className="mx-auto min-h-[calc(100dvh-56px)] w-full max-w-[402px] pb-[112px]">
        {isPending && <Skeleton variant="list" count={2} />}
        {!isValidPostingId && (
          <DetailUnavailableState
            title="잘못된 공고 주소입니다."
            description="공고 주소를 다시 확인해주세요."
            onGoHome={() => navigate('/')}
          />
        )}
        {isError && (
          <div className="mx-5 mt-5">
            <ErrorState
              message="공고 정보를 불러오지 못했습니다."
              onRetry={() => {
                void refetch();
              }}
            />
          </div>
        )}
        {data === null && (
          <DetailUnavailableState
            title="공고를 찾을 수 없습니다."
            description={'삭제되었거나 더 이상 제공되지 않는 공고입니다.\n다른 공고를 확인해주세요.'}
            onGoHome={() => navigate('/')}
          />
        )}
        {data && (
          <article className="flex flex-col items-start gap-6">
            <div className="h-[200px] w-full bg-[#E8EEF5]">
              <PostingThumbnail src={data.posterUrl} alt={data.title} type={data.type} />
            </div>

            <div className="flex min-h-[422.5px] w-full flex-col items-center justify-center gap-5">
              <div className="flex h-[94.5px] w-full flex-col items-start gap-5">
                <div className="flex w-full flex-col items-start gap-3 px-5">
                  <div className="flex h-[27.5px] items-center gap-2">
                    <TypeBadge posting={data} />
                    <DayBadge deadline={data.deadline} variant="detail" />
                  </div>

                  <div className="flex w-full flex-col items-start">
                    <h2 className="w-full text-[20px] font-semibold leading-[140%] text-[#000B24]">
                      {data.title}
                    </h2>
                    <div className="mt-0.5 flex w-full items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-1 text-[10px] font-medium leading-[160%] text-[#8C8C8C]">
                        <img
                          src={organizationIcon}
                          alt=""
                          aria-hidden="true"
                          className="size-[12.35px] shrink-0"
                        />
                        <span className="truncate">{data.organization}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[12px] font-medium leading-[160%] text-[#8C8C8C]">
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
                </div>
              </div>

              <section className="flex min-h-[124px] w-[362px] flex-col items-center justify-center gap-1 rounded-2xl bg-[linear-gradient(95.86deg,#EFF6FF_0%,#F5FFFA_100%)] px-4 py-3">
                <h3 className="flex h-5 w-[330px] items-center text-[14px] font-semibold leading-[140%] tracking-[-0.241437px] text-[#67A6FF]">
                  FitMe 공모전 정보 요약
                </h3>
                <div className="flex min-h-[76px] w-[330px] flex-col items-start gap-1">
                  <p className="flex min-h-[76px] w-[330px] items-center whitespace-pre-line text-[12px] font-medium leading-[19.2px] text-[#404040] [font-family:Pretendard]">
                    {data.aiSummary || DETAIL_SUMMARY}
                  </p>
                </div>
              </section>

              <section className="flex min-h-[164px] w-full flex-col items-start gap-7 pb-2">
                <DetailInfoTabs activeTab={activeTab} onChange={setActiveTab} />
                <DetailInfoContent activeTab={activeTab} posting={data} />
              </section>
            </div>

            <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[390px] -translate-x-1/2 items-center gap-3 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3">
              <DetailSaveButton posting={data} />
              <button
                type="button"
                onClick={() => handleApplyClick(data)}
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
