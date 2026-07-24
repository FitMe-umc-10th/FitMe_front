import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout, Header } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';
import { getHistoryDetail, updateHistoryMemo } from '@/apis/history';

import type { UserApplication } from '@/types/history';

type DetailTabType = 'PERIOD' | 'BENEFITS' | 'ELIGIBILITY';

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const historyId = Number(id);

  const [activeTab, setActiveTab] = useState<DetailTabType>('PERIOD');
  const [memoText, setMemoText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 이력 상세 정보 조회
  const {
    data: historyItem,
    isLoading,
    isError,
  } = useQuery<UserApplication>({
    queryKey: ['historyDetail', historyId],
    queryFn: () => getHistoryDetail(historyId),
    enabled: !isNaN(historyId),
  });

  // 조회된 메모 필드 상태 동기화
  useEffect(() => {
    if (historyItem) {
      setMemoText(historyItem.memo || '');
    }
  }, [historyItem]);

  // 메모 변경 Mutation
  const updateMemoMutation = useMutation({
    mutationFn: (newMemo: string) => updateHistoryMemo(historyId, newMemo),
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historyDetail', historyId] });
      queryClient.invalidateQueries({ queryKey: ['historyList'] });
      setIsSaving(false);
      showToast('메모가 자동으로 저장되었습니다.', 'success');
    },
    onError: () => {
      setIsSaving(false);
      showToast('메모 저장에 실패했습니다.', 'error');
    },
  });

  // 메모 포커스 아웃 시 자동 저장
  const handleMemoBlur = () => {
    if (historyItem && memoText !== (historyItem.memo || '')) {
      updateMemoMutation.mutate(memoText);
    }
  };

  // 링크 공유 기능
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast('이력 상세 링크가 클립보드에 복사되었습니다.', 'success');
      })
      .catch(() => {
        showToast('공유 링크 복사에 실패했습니다.', 'error');
      });
  };

  if (isLoading) {
    return (
      <Layout header={<Header title="이력 상세" showBack={true} />}>
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (isError || !historyItem) {
    return (
      <Layout header={<Header title="이력 상세" showBack={true} />}>
        <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-500 font-semibold mb-4">
            해당 이력 데이터를 불러올 수 없습니다.
          </p>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-semibold transition-colors"
          >
            이력 목록으로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  const post = historyItem?.post;

  const {
    gradeRequirement = '상세 페이지 참조',
    incomeRequirement = '상세 페이지 참조',
    regionRequirement = '상세 페이지 참조',
    supportAmount = '상세 페이지 참조',
  } = post?.scholarship || {};

  return (
    <Layout
      header={
        <header className="relative flex h-14 items-center justify-between bg-white px-4 border-b border-gray-100/50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
              <path
                d="M15 18L9 12L15 6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-bold text-slate-900 select-none text-center">
            이력 상세
          </h1>
          <button
            type="button"
            onClick={handleShare}
            aria-label="공유"
            className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </header>
      }
    >
      <div className="flex flex-col pb-8">
        {/* 포스터 배너 */}
        <div className="relative w-full h-[220px] bg-slate-900 overflow-hidden">
          {post?.applicationUrl ? (
            <img
              src={post?.applicationUrl}
              alt={post?.title}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              포스터 이미지가 없습니다.
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* 공고 기본 정보 */}
        <div className="px-5 pt-6 pb-4">
          <h2 className="font-bold text-slate-900 text-[20px] leading-[1.3] tracking-[-0.4px] mb-3">
            {post?.title}
          </h2>

          <div className="flex items-center justify-between">
            {/* 기관명 */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-slate-400"
              >
                <path d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6" />
              </svg>
              <span>{post?.organizer}</span>
            </div>

            {/* 통계 (조회수, 찜) */}
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
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
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {post?.viewCount?.toLocaleString() ?? '0'}
              </span>
              <span className="flex items-center gap-1">
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
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                {post?.savedCount?.toLocaleString() ?? '0'}
              </span>
            </div>
          </div>
        </div>

        {/* 상세 탭 메뉴 */}
        <div className="flex border-b border-gray-100 bg-white mt-2 px-1">
          {(
            [
              { label: '접수 기간', value: 'PERIOD' },
              { label: '활동 혜택', value: 'BENEFITS' },
              { label: '지원 자격', value: 'ELIGIBILITY' },
            ] as const
          ).map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`relative h-12 flex-1 text-sm font-semibold transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600 font-bold' : 'text-gray-400'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* 탭 내용 영역 */}
        <div className="px-5 py-6 min-h-[140px]">
          {activeTab === 'PERIOD' && (
            <div className="flex flex-col gap-5">
              <div>
                <h4 className="text-xs font-bold text-blue-500 mb-1.5">일시</h4>
                <p className="text-sm font-semibold text-slate-800">
                  {post?.applyStartAt && post?.applyEndAt
                    ? `${post.applyStartAt.replace(/-/g, '. ')} ~ ${post.applyEndAt.replace(/-/g, '. ')}`
                    : '접수 기간 정보가 없습니다.'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-500 mb-1.5">접수 방법</h4>
                <p className="text-sm font-semibold text-slate-800">
                  {post?.applicationMethod || '접수 방법 정보가 없습니다.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'BENEFITS' && (
            <div className="flex flex-col gap-5">
              <div>
                <h4 className="text-xs font-bold text-blue-500 mb-1.5">시상 규모</h4>
                <p className="text-sm font-semibold text-slate-800">{supportAmount}</p>
              </div>
            </div>
          )}

          {activeTab === 'ELIGIBILITY' && (
            <div className="flex flex-col gap-5">
              <div>
                <h4 className="text-xs font-bold text-blue-500 mb-1.5">대상</h4>
                <p className="text-sm font-semibold text-slate-800">{gradeRequirement}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-500 mb-1.5">소득 분위</h4>
                <p className="text-sm font-semibold text-slate-800">{incomeRequirement}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-500 mb-1.5">거주지</h4>
                <p className="text-sm font-semibold text-slate-800">{regionRequirement}</p>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="h-2 bg-slate-50 border-y border-slate-100/50" />

        {/* 나의 메모 영역 */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-slate-800 text-[15px] tracking-[-0.3px]">나의 메모</h3>
            {isSaving && (
              <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-1">
                <span className="inline-block size-1.5 rounded-full bg-blue-500 animate-ping" />
                자동 저장 중...
              </span>
            )}
          </div>

          <textarea
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            onBlur={handleMemoBlur}
            placeholder="이력에 대한 메모를 자유롭게 남겨보세요. 입력 시 자동으로 저장됩니다."
            className="w-full min-h-[220px] p-4 border border-slate-100 bg-slate-50/30 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all duration-200 outline-none text-slate-700 text-sm leading-relaxed resize-none font-medium placeholder:text-slate-350"
          />
        </div>
      </div>
    </Layout>
  );
}
