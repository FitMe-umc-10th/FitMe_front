import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components';
import { getDeadlineNotifications } from '@/apis/deadlineNotification';

export default function NotificationList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. 알림 데이터 조회
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['deadlineNotifications'],
    queryFn: getDeadlineNotifications,
  });

  // 2. 알림 읽음 처리 Mutation(해야 함!!)
  // const markAsReadMutation = useMutation({
  //   mutationFn: markAsRead,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['notifications'] });
  //   },
  // });

  // const handleNotificationClick = (notification: Notification) => {
  //   if (!notification.isRead) {
  //     markAsReadMutation.mutate(notification.id);
  //   }
  // };

  // const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

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
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 font-pretendard text-center">
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
            {/* {unreadCount > 0 && (
              <div
                className="flex items-center justify-center rounded-full bg-[#E5F1FF] text-[#0066FF] select-none font-bold"
                style={{
                  width: '25px',
                  height: '26px',
                  fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
                  fontSize: '14px',
                  lineHeight: '18px',
                }}
              >
                {unreadCount}
              </div>
            )} */}
          </div>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 font-pretendard select-none text-center">
            알림
          </h1>

          <div className="w-[70px] h-[41px] shrink-0" />
        </header>
      }
      className="bg-white"
    >
      <div className="w-full max-w-[402px] mx-auto bg-white flex flex-col">
        {notifications && notifications.notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.notifications.map((notification) => {
              const isUnread = !notification.isRead;
              return (
                <div
                  key={notification.notificationId}
                  // onClick={() => handleNotificationClick(notification)}
                  className={`group flex flex-col justify-center h-[106px] min-h-[106px] pt-[28px] pr-[20px] pb-[28px] pl-[20px] border-b border-gray-100 transition-colors duration-150 cursor-pointer ${
                    isUnread ? 'bg-[#F0F6FF] hover:bg-[#E3EDFD]' : 'bg-white hover:bg-gray-50'
                  }`}
                  style={{ opacity: 1 }}
                >
                  {/* 첫 번째 행: [카테고리] 제목 + 시간 */}
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0 pr-4">
                      <h2 className="text-[16px] font-semibold font-pretendard leading-[140%] text-gray-950 truncate select-none">
                        <span className={isUnread ? 'text-[#0066FF]' : 'text-gray-400'}>
                          [{notification.categoryPrefix}]
                        </span>{' '}
                        {notification.title}
                      </h2>
                    </div>
                    <span className="text-[14px] font-medium font-pretendard leading-[140%] text-gray-400 shrink-0 select-none">
                      {notification.createdAt}
                    </span>
                  </div>

                  {/* 두 번째 행: 알림 본문 */}
                  <div className="mt-[8px] w-full">
                    <p className="text-[14px] font-medium font-pretendard leading-[140%] text-gray-700 truncate select-none">
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="size-12 mb-4 text-gray-300"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a9.001 9.001 0 0 1-11.963-9.4A8.961 8.961 0 0 1 12 3c1.252 0 2.455.256 3.548.709m-1.745 12.012a9 9 0 0 1 0-14.544M12 21H12.008M12 18H12.008"
              />
            </svg>
            <p className="text-sm font-medium">새로운 알림이 없습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
