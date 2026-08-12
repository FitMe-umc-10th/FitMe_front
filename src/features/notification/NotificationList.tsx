import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ErrorState, Layout } from '@/shared/components';
import EmptyState from '@/shared/components/EmptyState';
import {
  deadlineNotificationQueryKeys,
  getDeadlineNotifications,
} from '@/apis/deadlineNotification';

const NOTIFICATION_PAGE_SIZE = 15;

export default function NotificationList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useInfiniteQuery({
    queryKey: deadlineNotificationQueryKeys.list,
    queryFn: ({ pageParam }) => getDeadlineNotifications(NOTIFICATION_PAGE_SIZE, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  useEffect(() => {
    if (dataUpdatedAt > 0) {
      queryClient.setQueryData(deadlineNotificationQueryKeys.unreadCount, 0);
    }
  }, [dataUpdatedAt, queryClient]);

  const handleNotificationClick = (postId: number | null) => {
    if (postId !== null) {
      navigate(`/postings/${postId}`);
    }
  };

  if (isLoading) {
    return (
      <Layout
        header={
          <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <svg
                viewBox="0 0 11 19"
                aria-hidden="true"
                style={{ width: '10.25px', height: '18.45px' }}
              >
                <path
                  d="M9 1.5L1.5 9.225L9 16.95"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.05"
                />
              </svg>
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 text-center">
              알림
            </h1>
          </header>
        }
      >
        <div className="w-full max-w-[402px] mx-auto bg-white flex flex-col">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[106px] flex flex-col justify-center px-[20px] py-[28px] border-b border-gray-100 animate-pulse"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-12" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      header={
        <header className="relative flex h-14 items-center justify-between bg-white px-4 border-b border-gray-100/50">
          <div className="flex items-center gap-1.5 shrink-0 min-w-[70px]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <svg
                viewBox="0 0 11 19"
                aria-hidden="true"
                style={{ width: '10.25px', height: '18.45px' }}
              >
                <path
                  d="M9 1.5L1.5 9.225L9 16.95"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.05"
                />
              </svg>
            </button>
          </div>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 select-none text-center">
            알림
          </h1>

          <div className="w-[70px] h-[41px] shrink-0" />
        </header>
      }
      className="bg-white"
    >
      <div className="w-full max-w-[402px] mx-auto bg-white flex flex-col">
        {isError ? (
          <div className="px-5 py-20">
            <ErrorState
              message="알림을 불러오지 못했습니다."
              onRetry={() => {
                void refetch();
              }}
            />
          </div>
        ) : notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((notification) => {
              const isUnread = !notification.isRead;
              return (
                <div
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification.postId)}
                  className={`group flex flex-col justify-center min-h-[106px] px-[20px] py-[20px] border-b border-gray-100/80 transition-colors duration-150 cursor-pointer ${
                    isUnread ? 'bg-[#F0F6FF] hover:bg-[#E3EDFD]' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {/* 첫 번째 행: [카테고리 뱃지] + 알림 제목 + 시간 */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-[8px] flex-1 min-w-0 pr-2">
                      <span
                        className={`px-[8px] py-[4px] rounded-[6px] text-[12px] font-semibold leading-[1.2] shrink-0 select-none ${
                          isUnread ? 'bg-[#E5F1FF] text-[#0066FF]' : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {notification.categoryPrefix}
                      </span>
                      <h2 className="text-[16px] font-semibold leading-[140%] text-gray-950 truncate select-none">
                        {notification.title}
                      </h2>
                    </div>
                    <span className="text-[13px] font-medium leading-[140%] text-gray-400 shrink-0 select-none">
                      {notification.displayTime || notification.createdAt}
                    </span>
                  </div>

                  {/* 두 번째 행: 알림 본문 */}
                  <div className="mt-[8px] w-full">
                    <p className="text-[14px] font-medium leading-[140%] text-gray-600 truncate select-none">
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })}
            {hasNextPage && (
              <button
                type="button"
                disabled={isFetchingNextPage}
                onClick={() => {
                  void fetchNextPage();
                }}
                className="mx-5 my-4 h-10 rounded-[10px] bg-[#F3F6FA] text-[13px] font-semibold text-[#404040] disabled:text-[#A5A5A5]"
              >
                {isFetchingNextPage ? '불러오는 중...' : '알림 더보기'}
              </button>
            )}
          </div>
        ) : (
          <div className="py-20 flex items-center justify-center w-full">
            <EmptyState
              illustration="bell"
              message="새로운 알림이 없습니다"
              subMessage="새로운 소식이 도착하면 알려드릴게요!"
              messageClassName="text-[16px] text-slate-800"
              subMessageClassName="text-[13px] text-slate-400"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
