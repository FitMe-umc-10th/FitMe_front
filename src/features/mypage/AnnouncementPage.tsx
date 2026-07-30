import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAnnouncements, getAnnouncementDetail } from '@/apis/announcements';
import { Layout } from '@/shared/components';
import chevronLeftIcon from '@/assets/icons/chevron-left.svg';

export default function NoticeList() {
  const navigate = useNavigate();

  // 클릭 시 아코디언 형태로 본문이 펼쳐지도록 로컬 상태 관리 (타입 number로 매핑)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 1. 공지사항 데이터 조회
  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: getAnnouncements,
  });

  const { data: noticeDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['noticeDetail', expandedId],
    queryFn: () => getAnnouncementDetail(expandedId as number),
    enabled: !!expandedId,
  });

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <Layout
        header={
          <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
            <div className="w-[41px] h-[41px]" />
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 text-center">
              공지 사항
            </h1>
          </header>
        }
      >
        <div className="animate-pulse space-y-3 p-4">
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      header={
        <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
          >
            <img src={chevronLeftIcon} className="size-6" alt="뒤로가기" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 select-none text-center">
            공지 사항
          </h1>
          <div className="w-[41px] h-[41px]" />
        </header>
      }
      className="bg-white"
    >
      <div className="w-full max-w-[402px] mx-auto bg-white flex flex-col">
        {Array.isArray(notices) && notices.length > 0 ? (
          <div className="flex flex-col bg-white">
            {notices.map((notice) => {
              const isExpanded = expandedId === notice.announcementId;

              return (
                <div key={notice.announcementId} className="w-full flex flex-col">
                  {/* 헤더 영역 (클릭 시 토글) */}
                  <button
                    type="button"
                    onClick={() => handleToggle(notice.announcementId)}
                    className={`w-full h-[75px] px-[20px] py-[24px] flex items-center justify-between transition-colors focus:outline-none ${
                      notice.isNew ? 'bg-[#f0f6ff]/70' : 'bg-white border-b border-gray-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-[8px] min-w-0">
                      {/* 안내 배지 (w-45 h-27, 8px gap) */}
                      <span
                        className={`w-[45px] h-[27px] rounded-[8px] text-[12px] font-semibold leading-[160%] tracking-[-0.24px] flex items-center justify-center shrink-0 ${
                          notice.isNew ? 'bg-[#e6f0ff] text-[#0066ff]' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        안내
                      </span>
                      {/* 공지사항 제목 (16px SemiBold, leading-140%) */}
                      <span className="text-[16px] font-semibold leading-[140%] tracking-normal text-gray-800 truncate select-none">
                        {notice.title}
                      </span>
                    </div>

                    {/* 시간 표시 (12px Medium, leading-160%) */}
                    <span className="text-[12px] font-medium leading-[160%] tracking-normal text-gray-400 shrink-0 select-none ml-2">
                      {notice.createdAt}
                    </span>
                  </button>

                  {/* 펼쳐지는 본문 내용 */}
                  {isExpanded && (
                    <div
                      className={`px-[20px] py-[24px] text-[14px] leading-[150%] text-gray-600 whitespace-pre-wrap border-b border-gray-100/80 animate-fade-in-up ${
                        notice.isNew ? 'bg-[#f0f6ff]/40' : 'bg-slate-50/50'
                      }`}
                    >
                      {isDetailLoading || (noticeDetail && noticeDetail.announcementId !== notice.announcementId)
                        ? '공지사항 내용을 불러오는 중입니다...'
                        : noticeDetail?.content || '내용이 없습니다.'}
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
