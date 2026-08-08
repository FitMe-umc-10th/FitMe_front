import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout, Header, TabBar, Tab } from '@/shared/components';
import organizationIcon from '@/assets/icons/organization.svg';
import EmptyState from '@/shared/components/EmptyState';
import { useModalStore } from '@/store/modalStore';
import { useToastStore } from '@/store/toastStore';
import { getHistoryList, updateHistoryStatus } from '@/apis/history';

import type { UserApplicationListItem, HistoryStatus } from '@/types/history';

type TabType = 'IN_PROGRESS' | 'FINAL_PASSED';

export default function HistoryList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const showToast = useToastStore((state) => state.show);

  const [activeTab, setActiveTab] = useState<TabType>('IN_PROGRESS');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 이력 데이터 조회 (쿼리 파라미터 tab, page, size 전달)
  const { data: histories = [], isLoading } = useQuery<UserApplicationListItem[]>({
    queryKey: ['historyList', activeTab],
    queryFn: () => getHistoryList({ tab: activeTab, page: 0, size: 15 }),
  });

  // 상태 변경 Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userApplicationsId,
      status,
    }: {
      userApplicationsId: number;
      status: HistoryStatus;
    }) => updateHistoryStatus(userApplicationsId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historyList'] });
      showToast('상태가 성공적으로 변경되었습니다.', 'success');
    },
    onError: () => {
      openModal({
        title: '상태 변경에 실패했어요',
        description: '네트워크를 확인하고 다시 시도해주세요.',
        buttons: [
          {
            label: '확인',
            onClick: closeModal,
            variant: 'primary',
          },
        ],
      });
    },
  });

  // 바깥 영역 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 탭 필터링 (배열 가드 포함)
  const filteredHistories = (Array.isArray(histories) ? histories : []).filter((item) => {
    if (activeTab === 'FINAL_PASSED') {
      return item.status === 'FINAL_PASSED';
    }
    // IN_PROGRESS 탭에는 최종합격이 아닌 모든 건(DRAFT, IN_PROGRESS, DOCUMENT_PASS)이 노출됨
    return item.status !== 'FINAL_PASSED';
  });

  const tabs = [
    { label: '결과 대기', value: 'IN_PROGRESS' as const },
    { label: '최종 합격', value: 'FINAL_PASSED' as const },
  ];

  const getStatusLabel = (status: HistoryStatus) => {
    switch (status) {
      case 'DRAFT':
        return '작성중';
      case 'IN_PROGRESS':
        return '결과 대기';
      case 'DOCUMENT_PASS':
        return '서류 합격';
      case 'FINAL_PASSED':
        return '최종 합격';
    }
  };

  const getStatusButtonClass = (status: HistoryStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'border border-slate-200 text-slate-400 bg-white hover:bg-slate-50';
      case 'IN_PROGRESS':
        return 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50';
      case 'DOCUMENT_PASS':
        return 'border border-blue-200 text-blue-500 bg-white hover:bg-blue-50/30';
      case 'FINAL_PASSED':
        return 'border border-blue-500 text-blue-600 bg-blue-50/50 hover:bg-blue-100/50';
    }
  };

  return (
    <Layout header={<Header title="이력" />} tabBar={<TabBar />} className="bg-slate-50/50">
      <Tab tabs={tabs} active={activeTab} onChange={(val) => setActiveTab(val)} />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="pt-[170px]">
          <EmptyState
            message={
              activeTab === 'IN_PROGRESS'
                ? '결과 대기중인 공고가 없어요'
                : '최종 합격 한 공고가 없어요'
            }
            subMessage={
              activeTab === 'IN_PROGRESS'
                ? '나에게 딱 맞는 장학금과 공모전을\n탐색 탭에서 찾아보세요!'
                : '진행 중인 공고 상태를 최종 합격으로\n바꿔 나의 이력을 관리해봐요.'
            }
            illustration="clock"
            cta={
              activeTab === 'IN_PROGRESS'
                ? {
                    label: '공고 보러 가기',
                    onClick: () => navigate('/explore'),
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-x-[14px] gap-y-[16px] px-[15px] py-[20px]"
          ref={dropdownRef}
        >
          {filteredHistories.map((item) => (
            <div
              key={item.userApplicationId}
              onClick={() => navigate(`/history/${item.userApplicationId}`)}
              className="group relative w-[173px] h-[226.13px] bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none overflow-visible"
            >
              {/* 상단: 공고 포스터 영역 */}
              <div className="w-[173px] h-[102px] rounded-t-[16px] overflow-hidden relative bg-slate-50 flex-shrink-0 z-0">
                {item.posterImageUrl ? (
                  <img
                    src={item.posterImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-[10px]">
                    이미지 없음
                  </div>
                )}
              </div>

              {/* 하단: 서로 침범하며 오버랩되는 흰색 콘텐츠 영역 */}
              <div className="w-[173px] h-[152.13px] rounded-[16px] border-r border-b border-l border-slate-100 bg-white pt-[12px] pb-[12px] px-[12.43px] flex flex-col justify-between absolute bottom-0 left-0 z-10">
                {/* 상단: 제목 레이아웃 (w-148.14, h-38.55) */}
                <div className="w-[148.14px] h-[38.55px] flex flex-col gap-[2px] min-w-0">
                  <h3 className="font-bold text-slate-800 text-[12px] leading-[1.3] tracking-[-0.24px] truncate group-hover:text-blue-600 transition-colors">
                    {item.title || '제목 정보 없음'}
                  </h3>
                  <div className="flex items-center gap-[4px] text-[10px] text-slate-400 font-medium h-[15px] truncate">
                    <img src={organizationIcon} alt="" aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">{item.organizer || '기관 정보 없음'}</span>
                  </div>
                </div>

                {/* 중간: 메모 박스 (w-146.07, h-42.36) */}
                <div className="w-[146.07px] h-[42.36px] bg-[#f0f5ff]/70 border border-blue-50/20 rounded-[8px] pt-[5.18px] pr-[7.25px] pb-[5.18px] pl-[7.25px] flex items-center justify-start mx-auto overflow-hidden">
                  <p className="text-[10px] text-slate-500 font-semibold leading-[1.3] line-clamp-2 text-left">
                    {item.memo || '작성된 메모가 없습니다.'}
                  </p>
                </div>

                {/* 하단: 상태 변경 버튼 및 드롭다운 (버튼과 메모박스 사이 12.43px 차이) */}
                <div className="relative mt-[12.43px] flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(
                        openDropdownId === item.userApplicationId ? null : item.userApplicationId,
                      );
                    }}
                    className={`flex items-center justify-center h-7 px-3.5 rounded-full text-[11px] font-semibold transition-all duration-200 active:scale-95 cursor-pointer min-w-[70px] ${getStatusButtonClass(
                      item.status,
                    )}`}
                  >
                    {item.status === 'DRAFT' ? '-' : getStatusLabel(item.status)}
                  </button>

                  {/* 드롭다운 옵션 메뉴 */}
                  {openDropdownId === item.userApplicationId && (
                    <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-40 w-[100px] bg-white border border-slate-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1 font-['Pretendard'] overflow-hidden">
                      {(
                        ['DRAFT', 'IN_PROGRESS', 'DOCUMENT_PASS', 'FINAL_PASSED'] as HistoryStatus[]
                      ).map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(null);
                            updateStatusMutation.mutate({
                              userApplicationsId: item.userApplicationId,
                              status: statusOption,
                            });
                          }}
                          className={`w-full py-2 text-center text-[11px] font-semibold transition-colors cursor-pointer
                              ${
                                item.status === statusOption
                                  ? 'bg-blue-50/50 text-blue-600'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                        >
                          {statusOption === 'DRAFT' ? '작성중' : getStatusLabel(statusOption)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
