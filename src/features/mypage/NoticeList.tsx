import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotices } from '@/apis/mypage';
import { Header, Layout } from '@/shared/components';

export default function NoticeList() {
  // 1. 공지사항 데이터 조회
  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  // 클릭 시 아코디언 형태로 본문이 펼쳐지도록 로컬 상태 관리
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <Layout header={<Header title="공지사항" showBack />}>
        <div className="animate-pulse space-y-3 p-4">
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout header={<Header title="공지사항" showBack />} className="bg-slate-50/50">
      <div className="p-4">
        {notices && notices.length > 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm divide-y divide-gray-50">
            {notices.map((notice) => {
              const isExpanded = expandedId === notice.id;

              return (
                <div key={notice.id} className="transition-all">
                  {/* 헤더 영역 (클릭 시 토글) */}
                  <button
                    type="button"
                    onClick={() => handleToggle(notice.id)}
                    className="flex w-full items-start justify-between p-4 text-left hover:bg-gray-50/50 active:bg-gray-100/30 transition-colors focus:outline-none"
                  >
                    <div className="min-w-0 flex-1 pr-3 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 공지사항 태그 */}
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 shadow-sm">
                          {notice.type}
                        </span>
                        {/* 새 소식 N 배지 */}
                        {notice.isNew && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm shrink-0">
                            N
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-gray-400">
                          {notice.createdAt}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 leading-snug">
                        {notice.title}
                      </h4>
                    </div>

                    {/* 화살표 아이콘 */}
                    <svg
                      className={`size-4.5 text-gray-400 mt-1 shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-blue-500' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 펼쳐지는 본문 내용 */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 px-4 pb-5 pt-3 text-xs leading-relaxed text-gray-500 whitespace-pre-line border-t border-gray-50 animate-fade-in-up">
                      {notice.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-gray-400">등록된 공지사항이 없습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
