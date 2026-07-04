import { useQuery } from '@tanstack/react-query';
import { getPostings } from '@/apis/posting';
import PostingCard from '@/shared/components/PostingCard';
import Carousel from '@/shared/components/Carousel';
import { Header, Layout, ProgressBar, Tab, TabBar } from '@/shared/components';
import { useModalStore } from '@/store/modalStore';
import { useToastStore } from '@/store/toastStore';
import { useState } from 'react';

// 보일러플레이트 및 공통 컴포넌트 검증용 홈 화면
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'scholarship' | 'contest'>('all');
  const openModal = useModalStore((state) => state.openModal);
  const toast = useToastStore();
  const { data, isPending, isError } = useQuery({
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
        {/* 기존 develop 홈 화면 콘텐츠 */}
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

        {/* 구분선 및 공통 컴포넌트 검증용 데모 (PR 7) */}
        <hr className="border-gray-200 my-8" />
        <div className="text-center py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            C 파트 공통 컴포넌트 동작 확인 영역
          </p>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-950">ProgressBar</h3>
          <p className="mt-1 text-sm text-gray-500">온보딩 2 / 4 단계 예시</p>
          <div className="mt-4">
            <ProgressBar current={2} total={4} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h3 className="px-4 pt-4 text-base font-semibold text-gray-950">Tab</h3>
          <p className="px-4 pt-1 text-sm text-gray-500">상단 탭 전환 예시</p>
          <div className="mt-3">
            <Tab
              tabs={[
                { label: '전체', value: 'all' },
                { label: '장학금', value: 'scholarship' },
                { label: '공모전', value: 'contest' },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />
          </div>
          <p className="px-4 py-3 text-sm font-medium text-blue-600">현재 탭: {activeTab}</p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-950">Modal / Toast</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                openModal({
                  title: '공식 홈페이지로 이동하시겠어요?',
                  description: '확인을 누르면 외부 페이지로 이동하는 상황을 가정합니다.',
                  buttons: [
                    { label: '취소', variant: 'secondary' },
                    {
                      label: '이동하기',
                      variant: 'primary',
                      onClick: () => toast.success('이동 버튼을 눌렀어요.'),
                    },
                  ],
                })
              }
              className="h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white"
            >
              모달 열기
            </button>
            <button
              type="button"
              onClick={() => toast.error('저장 해제에 실패했어요.')}
              className="h-12 rounded-xl bg-gray-900 text-sm font-semibold text-white"
            >
              토스트 띄우기
            </button>
          </div>
        </section>

        {/* API 데이터 상태 확인용 */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-950">API Load State</h3>
          {isPending && <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>}
          {isError && <p className="mt-2 text-sm text-red-500">에러가 발생했어요.</p>}
          {!isPending && !isError && <p className="mt-2 text-sm text-green-600">성공적으로 로드됨</p>}
        </section>
      </section>
    </Layout>
  );
}