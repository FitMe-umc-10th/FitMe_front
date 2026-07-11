import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsAsRead } from '@/apis/notification';
import { Header, Layout } from '@/shared/components';
import type { NotificationItem } from '@/types/notification';

function formatNotificationTime(createdAt: string) {
  const now = new Date('2026-07-12T12:00:00+09:00').getTime();
  const target = new Date(createdAt).getTime();
  const diffDays = Math.max(0, Math.floor((now - target) / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return '2시간 전';
  if (diffDays === 1) return '어제';
  return `${diffDays}일 전`;
}

function NotificationListItem({ notification }: { notification: NotificationItem }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/postings/${notification.postingId}`)}
      className={`w-full border-b border-gray-100 px-5 py-5 text-left transition-colors hover:bg-blue-50 ${
        notification.isRead ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-blue-600">{notification.title}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">{notification.message}</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400">
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
  });

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <Layout header={<Header title="알림" showBack />} className="bg-white">
      <section className="min-h-[calc(100dvh-56px)] bg-white">
        {isPending && (
          <div className="space-y-4 px-5 py-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
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
          <div>
            {data.map((notification) => (
              <NotificationListItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
