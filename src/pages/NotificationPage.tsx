import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsAsRead } from '@/apis/notification';
import { Layout } from '@/shared/components';
import type { NotificationItem } from '@/types/notification';

function formatNotificationTime(createdAt: string) {
  const now = new Date('2026-07-12T12:00:00+09:00').getTime();
  const target = new Date(createdAt).getTime();
  const diffDays = Math.max(0, Math.floor((now - target) / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return '2시간 전';
  if (diffDays === 1) return '어제';
  return `${diffDays}일 전`;
}

function splitNotificationTitle(title: string) {
  const matchedTitle = title.match(/^(\[[^\]]+\])\s*(.*)$/);

  if (!matchedTitle) {
    return { prefix: '', content: title };
  }

  return {
    prefix: matchedTitle[1],
    content: matchedTitle[2],
  };
}

function NotificationHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-center bg-white px-5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="absolute left-4 flex size-10 items-center justify-center rounded-full text-[#333333] transition-colors hover:bg-gray-100"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7">
          <path
            d="M15.5 4.5L8 12L15.5 19.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
      </button>
      <h1 className="text-[18px] font-extrabold leading-none text-[#0F172A]">알림</h1>
    </header>
  );
}

function NotificationListItem({ notification }: { notification: NotificationItem }) {
  const navigate = useNavigate();
  const isRead = notification.isRead;
  const { prefix, content } = splitNotificationTitle(notification.title);

  return (
    <button
      type="button"
      onClick={() => navigate(`/postings/${notification.postingId}`)}
      className={`w-full text-left transition-colors ${
        isRead ? 'bg-white hover:bg-gray-50' : 'bg-[#EEF6FF] hover:bg-[#E6F2FF]'
      }`}
    >
      <div className="mx-5 flex min-h-[92px] items-start justify-between gap-4 border-b border-[#EEF0F3] py-5">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="line-clamp-2 text-[15px] font-extrabold leading-[1.45] text-[#202124]">
            {prefix && (
              <span className={isRead ? 'text-[#8C8C8C]' : 'text-[#0059FF]'}>
                {prefix}
              </span>
            )}
            {prefix && ' '}
            <span>{content}</span>
          </p>
          <p className="line-clamp-2 text-[14px] font-semibold leading-[1.55] text-[#202124]">
            {notification.message}
          </p>
        </div>
        <span className="mt-0.5 shrink-0 text-[13px] font-semibold text-[#A1A1A1]">
          {formatNotificationTime(notification.createdAt)}
        </span>
      </div>
    </button>
  );
}

export default function NotificationPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unreadCount'] });

      const previousNotifications = queryClient.getQueryData<NotificationItem[]>(['notifications']);
      const previousUnreadCount = queryClient.getQueryData<number>(['notifications', 'unreadCount']);

      queryClient.setQueryData<NotificationItem[]>(['notifications'], (old) => {
        if (!old) return old;

        return old.map((notification) => ({ ...notification, isRead: true }));
      });
      queryClient.setQueryData(['notifications', 'unreadCount'], 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (typeof context?.previousUnreadCount === 'number') {
        queryClient.setQueryData(['notifications', 'unreadCount'], context.previousUnreadCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
  });

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <Layout header={<NotificationHeader />} className="bg-white">
      <section className="min-h-[calc(100dvh-72px)] bg-white">
        {isPending && (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[92px] animate-pulse rounded-xl bg-[#F3F7FC]" />
            ))}
          </div>
        )}
        {isError && (
          <p className="mx-5 mt-5 rounded-2xl bg-red-50 px-4 py-5 text-sm font-medium text-red-500">
            알림을 불러오지 못했어요.
          </p>
        )}
        {data && data.length === 0 && (
          <div className="flex min-h-[320px] items-center justify-center px-5 text-center text-sm font-medium text-slate-400">
            아직 받은 알림이 없어요.
          </div>
        )}
        {data && data.length > 0 && (
          <div className="pb-6">
            {data.map((notification) => (
              <NotificationListItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
