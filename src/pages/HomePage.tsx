import { useQuery } from '@tanstack/react-query';
import { getPostings } from '@/apis/posting';
import { Header, Layout, ProgressBar, Tab, TabBar } from '@/shared/components';
import { useModalStore } from '@/store/modalStore';
import { useToastStore } from '@/store/toastStore';
import { useState } from 'react';

// 보일러플레이트 동작 확인용 예시 페이지.
// 실제 홈 피드(3섹션)는 features/posting 또는 별도 화면으로 구현하세요.
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
        <div>
          <h2 className="text-2xl font-bold text-blue-600">FitMe</h2>
          <p className="mt-1 text-sm text-gray-500">
            C 파트 공통 컴포넌트 동작 확인용 예시 페이지
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

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-950">Mock Posting List</h3>
          <p className="mt-1 text-sm text-gray-500">기존 보일러플레이트 API 확인 영역</p>
          {isPending && <p className="mt-4 text-sm text-gray-500">불러오는 중...</p>}
          {isError && <p className="mt-4 text-sm text-red-500">에러가 발생했어요.</p>}
          <ul className="mt-4 space-y-3">
            {data?.map((posting) => (
              <li key={posting.id} className="rounded-xl border border-gray-200 p-3">
                <span className="text-xs text-gray-400">
                  {posting.type === 'SCHOLARSHIP' ? '장학금' : '공모전'}
                </span>
                <p className="mt-1 font-semibold text-gray-950">{posting.title}</p>
                <p className="text-sm text-gray-500">{posting.organization}</p>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </Layout>
  );
}
