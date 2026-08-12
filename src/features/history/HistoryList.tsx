import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteHistory, getHistoryList, updateHistoryStatus } from '@/apis/history';
import organizationIcon from '@/assets/icons/organization.svg';
import { Layout, Tab, TabBar } from '@/shared/components';
import EmptyState from '@/shared/components/EmptyState';
import { useModalStore } from '@/store/modalStore';
import { useToastStore } from '@/store/toastStore';
import type { HistoryStatus, UserApplicationListItem } from '@/types/history';

type TabType = 'IN_PROGRESS' | 'FINAL_PASSED';
type DisplayStatus = 'PENDING_RESULT' | 'DOCUMENT_PASSED' | 'FINAL_PASSED';

const STATUS_OPTIONS = [
  { label: '결과 대기', value: 'PENDING_RESULT' },
  { label: '서류 합격', value: 'DOCUMENT_PASSED' },
  { label: '최종 합격', value: 'FINAL_PASSED' },
] as const satisfies ReadonlyArray<{ label: string; value: HistoryStatus }>;

const STATUS_STYLE: Record<DisplayStatus, { label: string; pill: string; selected: string }> = {
  PENDING_RESULT: {
    label: '결과 대기',
    pill: 'h-6 w-[54px] border-[#BFBFBF] text-[#8C8C8C]',
    selected: 'bg-[#F2F2F2] text-[#8C8C8C]',
  },
  DOCUMENT_PASSED: {
    label: '서류 합격',
    pill: 'h-[26px] w-14 border-[#A7E0FF] text-[#069AFD]',
    selected: 'bg-[#EEFAFF] text-[#069AFD]',
  },
  FINAL_PASSED: {
    label: '최종 합격',
    pill: 'h-6 w-[54px] border-[#CEB8FF] text-[#8D54FF]',
    selected: 'bg-[#F0EEFF] text-[#8D54FF]',
  },
};

const normalizeStatus = (status: HistoryStatus): DisplayStatus => {
  switch (status) {
    case 'DOCUMENT_PASS':
    case 'DOCUMENT_PASSED':
      return 'DOCUMENT_PASSED';
    case 'FINAL_PASSED':
      return 'FINAL_PASSED';
    default:
      return 'PENDING_RESULT';
  }
};

const DELETE_THRESHOLD = 64;
const DELETE_VELOCITY_THRESHOLD = 0.45;

function SwipeToDelete({
  children,
  disabled,
  isDropdownOpen,
  onActivate,
  onDelete,
}: {
  children: ReactNode;
  disabled: boolean;
  isDropdownOpen: boolean;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef(0);
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startedAt: 0,
    lastX: 0,
    lastMovedAt: 0,
    velocityX: 0,
    isHorizontal: false,
  });
  const didSwipeRef = useRef(false);
  const isDeletingRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || (event.target as HTMLElement).closest('button')) return;

    gestureRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startedAt: event.timeStamp,
      lastX: event.clientX,
      lastMovedAt: event.timeStamp,
      velocityX: 0,
      isHorizontal: false,
    };
    didSwipeRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const deltaX = event.clientX - gestureRef.current.startX;
    const deltaY = event.clientY - gestureRef.current.startY;

    if (!gestureRef.current.isHorizontal) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      gestureRef.current.isHorizontal = true;
    }

    didSwipeRef.current = true;
    const elapsed = event.timeStamp - gestureRef.current.lastMovedAt;
    if (elapsed > 0) {
      gestureRef.current.velocityX =
        (event.clientX - gestureRef.current.lastX) / elapsed;
    }
    gestureRef.current.lastX = event.clientX;
    gestureRef.current.lastMovedAt = event.timeStamp;

    const nextOffset = Math.max(-110, Math.min(0, deltaX));
    offsetRef.current = nextOffset;
    setOffsetX(nextOffset);
  };

  const finishSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    const gestureElapsed = Math.max(event.timeStamp - gestureRef.current.startedAt, 1);
    const averageVelocity = offsetRef.current / gestureElapsed;
    const shouldDelete =
      offsetRef.current <= -DELETE_THRESHOLD ||
      gestureRef.current.velocityX <= -DELETE_VELOCITY_THRESHOLD ||
      averageVelocity <= -DELETE_VELOCITY_THRESHOLD;

    if (shouldDelete && !isDeletingRef.current) {
      isDeletingRef.current = true;
      offsetRef.current = -190;
      setOffsetX(-190);
      onDelete();
      return;
    }

    offsetRef.current = 0;
    setOffsetX(0);
  };

  const cancelSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    offsetRef.current = 0;
    setOffsetX(0);
  };

  return (
    <div
      className={`relative h-[218px] min-w-0 rounded-2xl bg-[#F95178] shadow-[0_0_8px_0_#00000014] touch-pan-y ${
        isDropdownOpen ? 'z-50 overflow-visible' : 'z-0 overflow-hidden'
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[72px] flex-col items-center justify-center gap-1 text-white">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
          <path d="M4 7H20M9 7V4H15V7M7 7L8 20H16L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[12px] font-semibold">삭제</span>
      </div>
      <div
        className={`relative h-full ${isDragging ? '' : 'transition-transform duration-200 ease-out'}`}
        style={{ transform: `translate3d(${offsetX}px, 0, 0)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishSwipe}
        onPointerCancel={cancelSwipe}
        onClick={onActivate}
        onClickCapture={(event) => {
          if (didSwipeRef.current) {
            event.preventDefault();
            event.stopPropagation();
            didSwipeRef.current = false;
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function HistoryList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const showToast = useToastStore((state) => state.show);
  const [activeTab, setActiveTab] = useState<TabType>('IN_PROGRESS');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const { data: histories = [], isLoading } = useQuery<UserApplicationListItem[]>({
    queryKey: ['historyList', activeTab],
    queryFn: () => getHistoryList({ tab: activeTab, page: 0, size: 15 }),
    refetchOnMount: 'always',
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userApplicationsId, status }: { userApplicationsId: number; status: HistoryStatus }) =>
      updateHistoryStatus(userApplicationsId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['historyList'] });
      showToast('상태가 성공적으로 변경되었습니다.', 'success');
    },
    onError: () => {
      openModal({
        title: '상태 변경에 실패했어요',
        description: '네트워크를 확인하고 다시 시도해주세요.',
        buttons: [{ label: '확인', onClick: closeModal, variant: 'primary' }],
      });
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: deleteHistory,
    onMutate: (userApplicationId) => {
      const previousLists = queryClient.getQueriesData<UserApplicationListItem[]>({
        queryKey: ['historyList'],
      });

      void queryClient.cancelQueries(
        { queryKey: ['historyList'] },
        { revert: false },
      );

      queryClient.setQueriesData<UserApplicationListItem[]>(
        { queryKey: ['historyList'] },
        (current) => current?.filter((item) => item.userApplicationId !== userApplicationId),
      );

      return { previousLists };
    },
    onSuccess: () => {
      showToast('이력이 삭제되었습니다.', 'success');
    },
    onError: (_error, _userApplicationId, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      openModal({
        title: '이력 삭제에 실패했어요',
        description: '네트워크를 확인하고 다시 시도해주세요.',
        buttons: [{ label: '확인', onClick: closeModal, variant: 'primary' }],
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['historyList'] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHistories = histories.filter((item) =>
    activeTab === 'FINAL_PASSED' ? item.status === 'FINAL_PASSED' : item.status !== 'FINAL_PASSED',
  );

  const tabs = [
    { label: '결과 대기', value: 'IN_PROGRESS' as const },
    { label: '최종 합격', value: 'FINAL_PASSED' as const },
  ];

  return (
    <Layout tabBar={<TabBar />} className="flex flex-col bg-white">
      <div className="bg-white pt-[37px]">
        <header className="mb-5 flex h-7 w-full items-center px-5">
          <h1 className="w-[35px] text-center text-[20px] font-semibold leading-[140%] text-[#000B24]">이력</h1>
        </header>
        <Tab tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message={activeTab === 'IN_PROGRESS' ? '결과 대기중인 공고가 없어요' : '최종 합격 한 공고가 없어요'}
            subMessage={
              activeTab === 'IN_PROGRESS'
                ? '나에게 딱 맞는 장학금과 공모전을\n탐색 탭에서 찾아보세요!'
                : '진행 중인 공고 상태를 최종 합격으로\n바꿔 나의 이력을 관리해봐요.'
            }
            illustration="clock"
            cta={activeTab === 'IN_PROGRESS' ? { label: '공고 보러 가기', onClick: () => navigate('/explore') } : undefined}
          />
        </div>
      ) : (
        <div ref={listRef} className="grid grid-cols-2 gap-x-4 gap-y-5 px-5 py-6">
          {filteredHistories.map((item) => {
            const status = normalizeStatus(item.status);
            const style = STATUS_STYLE[status];

            return (
              <SwipeToDelete
                key={item.userApplicationId}
                disabled={deleteHistoryMutation.isPending}
                isDropdownOpen={openDropdownId === item.userApplicationId}
                onActivate={() => navigate(`/history/${item.userApplicationId}`)}
                onDelete={() => deleteHistoryMutation.mutate(item.userApplicationId)}
              >
                <article
                  className="relative flex h-[218px] w-full cursor-pointer flex-col rounded-2xl bg-white"
                >
                <div className="z-0 h-[98px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-[#F2F2F2]">
                  {item.posterImageUrl ? (
                    <img src={item.posterImageUrl} alt={item.title} className="size-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[10px] text-[#A5A5A5]">이미지 없음</div>
                  )}
                </div>

                <div className="relative z-10 -mt-[27px] flex h-[147px] w-full shrink-0 flex-col items-center rounded-2xl bg-white pb-3">
                  <div className="flex h-[111px] w-full flex-col items-center justify-start gap-[10px] rounded-t-2xl px-3 py-3">
                    <div className="h-[39px] w-full min-w-0">
                      <h2 className="truncate text-[14px] font-semibold leading-[140%] tracking-[-0.241437px] text-[#1E1E1E]">
                        {item.title || '제목 정보 없음'}
                      </h2>
                      <div className="mt-0.5 flex h-[17px] items-center gap-1 text-[10px] font-medium leading-[160%] text-[#A5A5A5]">
                        <img src={organizationIcon} alt="" aria-hidden="true" className="size-2.5 shrink-0 opacity-70" />
                        <span className="truncate">{item.organizer || '기관 정보 없음'}</span>
                      </div>
                    </div>

                    <div
                      className={`flex w-full items-center rounded-lg bg-[#EFF6FF] px-[7px] py-[5px] ${
                        item.memo ? 'h-[42px]' : 'h-[26px]'
                      }`}
                    >
                      <p className={`${item.memo ? 'line-clamp-2' : 'truncate'} w-full text-[10px] font-medium leading-[160%] text-[#404040]`}>
                        {item.memo || '탭하여 메모를 남겨보세요'}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex h-6 justify-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenDropdownId(openDropdownId === item.userApplicationId ? null : item.userApplicationId);
                      }}
                      className={`flex items-center justify-center rounded-full border bg-black/[0.004] text-[10px] font-medium leading-[160%] ${style.pill}`}
                    >
                      {style.label}
                    </button>

                    {openDropdownId === item.userApplicationId && (
                      <div className="absolute left-1/2 top-[30px] z-[60] flex h-[105px] w-[109px] -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-[#F2F2F2] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                        {STATUS_OPTIONS.map((option) => {
                          const optionStyle = STATUS_STYLE[option.value];
                          const selected = option.value === status;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenDropdownId(null);
                                if (!selected) {
                                  updateStatusMutation.mutate({
                                    userApplicationsId: item.userApplicationId,
                                    status: option.value,
                                  });
                                }
                              }}
                              className={`flex h-[35px] w-full shrink-0 items-center justify-center border-b border-[#F2F2F2] text-[12px] font-medium leading-[160%] last:border-b-0 ${
                                selected ? optionStyle.selected : 'bg-white text-[#A5A5A5]'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                </article>
              </SwipeToDelete>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
