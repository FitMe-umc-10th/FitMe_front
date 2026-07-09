import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/apis/mypage';
import { Header, Layout, Switch } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';

export default function NotificationSettings() {
  const toast = useToastStore();
  const queryClient = useQueryClient();

  // 1. 유저 정보 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // 이메일 수신 주소 로컬 입력 상태 및 편집 상태 관리
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (profile) {
      setEmailInput(profile.notificationSettings.email);
    }
  }, [profile]);

  // 2. 알림 설정 수정 Mutation
  const { mutate: updateSettings } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      // 캐시 갱신
      queryClient.setQueryData(['profile'], updatedProfile);
      toast.success('알림 설정이 성공적으로 저장되었습니다.');
    },
    onError: () => {
      toast.error('알림 설정 변경에 실패했습니다.');
    },
  });

  // 토글 스위치 클릭 시 실시간 API 저장 핸들러
  const handleToggle = (key: 'appPushEnabled' | 'customRecommendationEnabled' | 'deadlineReminderEnabled') => {
    if (!profile) return;

    const currentVal = profile.notificationSettings[key];
    const newSettings = {
      ...profile.notificationSettings,
      [key]: !currentVal,
    };

    // 실시간 낙관적 업데이트 기법 느낌으로 호출
    updateSettings({
      notificationSettings: newSettings,
    });
  };

  // 이메일 저장 버튼 핸들러
  const handleSaveEmail = () => {
    if (!profile) return;

    // 간단한 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    const newSettings = {
      ...profile.notificationSettings,
      email: emailInput,
    };

    updateSettings({
      notificationSettings: newSettings,
    });
    setIsEditingEmail(false);
  };

  if (isLoading || !profile) {
    return (
      <Layout header={<Header title="알림 설정" showBack />}>
        <div className="animate-pulse space-y-6 p-4">
          <div className="h-[90px] rounded-2xl bg-gray-100" />
          <div className="h-[220px] rounded-2xl bg-gray-100" />
        </div>
      </Layout>
    );
  }

  const { notificationSettings: settings } = profile;

  return (
    <Layout header={<Header title="알림 설정" showBack />} className="bg-slate-50/50">
      <div className="space-y-6 p-4">
        {/* 1. 알림 수신 이메일 설정 */}
        <section className="space-y-2">
          <div className="px-1">
            <h3 className="text-sm font-bold text-gray-800">알림 수신 이메일</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              맞춤 공고 및 마감임박 리마인드 메일을 받을 주소입니다.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all">
            {isEditingEmail ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-bold text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="이메일 입력"
                  autoFocus
                />
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput(profile.notificationSettings.email);
                      setIsEditingEmail(false);
                    }}
                    className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEmail}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-sm font-bold text-gray-800 truncate pr-4">
                  {settings.email}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm shrink-0"
                >
                  변경
                </button>
              </>
            )}
          </div>
        </section>

        {/* 2. 기기 푸시 알림 설정 리스트 */}
        <section className="rounded-2xl border border-gray-100 bg-white px-4 py-1.5 shadow-sm">
          <ul className="divide-y divide-gray-100">
            {/* 앱 푸시 알림 */}
            <li className="flex items-center justify-between py-4.5">
              <span className="text-sm font-bold text-gray-800">앱 푸시 알림</span>
              <Switch
                checked={settings.appPushEnabled}
                onChange={() => handleToggle('appPushEnabled')}
              />
            </li>

            {/* 맞춤 공고 추천 알림 */}
            <li className="flex items-center justify-between py-4.5">
              <div className="pr-4 space-y-0.5">
                <span className="text-sm font-bold text-gray-800">맞춤 공고 추천 알림</span>
                <p className="text-xs font-medium text-gray-400">
                  내 핏 조건에 맞는 새로운 공고가 등록되면 알려드려요.
                </p>
              </div>
              <Switch
                checked={settings.customRecommendationEnabled}
                onChange={() => handleToggle('customRecommendationEnabled')}
              />
            </li>

            {/* 마감임박 알림 리마인드 */}
            <li className="flex items-center justify-between py-4.5">
              <div className="pr-4 space-y-0.5">
                <span className="text-sm font-bold text-gray-800">마감임박 알림 리마인드</span>
                <p className="text-xs font-medium text-gray-400">
                  찜한 공고의 마감일 전에 리마인드를 보내드려요.
                </p>
              </div>
              <Switch
                checked={settings.deadlineReminderEnabled}
                onChange={() => handleToggle('deadlineReminderEnabled')}
              />
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
