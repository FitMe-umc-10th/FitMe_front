import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getNotificationSettings, updateNotificationSettings } from '@/apis/mypage';
import { Layout, Switch } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  // 1. 유저 정보 조회
  const { data: notificationSettings, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: getNotificationSettings,
  });

  // 이메일 수신 주소 로컬 입력 상태 및 편집 상태 관리
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(notificationSettings?.notificationEmail || '');

  useEffect(() => {
    if (notificationSettings) {
      setEmailInput(notificationSettings.notificationEmail);
    }
  }, [notificationSettings]);

  // 2. 알림 설정 수정 Mutation
  const { mutate: updateSettings } = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (updatedNotificationSettings) => {
      queryClient.setQueryData(['notificationSettings'], updatedNotificationSettings);
      toast.success('알림 설정이 성공적으로 저장되었습니다.');
    },
    onError: () => {
      toast.error('알림 설정 변경에 실패했습니다.');
    },
  });

  // 토글 스위치 클릭 시 실시간 API 저장 핸들러
  const handleToggle = (key: 'pushEnabled' | 'recommendedEnabled' | 'reminderEnabled') => {
    if (!notificationSettings) return;

    const currentVal = notificationSettings[key];
    const newSettings = {
      ...notificationSettings,
      [key]: !currentVal,
    };

    updateSettings({
      ...newSettings,
    });
  };

  // 이메일 저장 버튼 핸들러
  const handleSaveEmail = () => {
    if (!notificationSettings) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    const newSettings = {
      ...notificationSettings,
      notificationEmail: emailInput,
    };

    updateSettings({
      ...newSettings,
    });
    setIsEditingEmail(false);
  };

  if (isLoading || !notificationSettings) {
    return (
      <Layout
        header={
          <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
            <div className="w-[41px] h-[41px]" />
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 font-pretendard text-center">
              알림 설정
            </h1>
          </header>
        }
      >
        <div className="animate-pulse space-y-6 p-4">
          <div className="h-[90px] rounded-2xl bg-gray-100" />
          <div className="h-[220px] rounded-2xl bg-gray-100" />
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
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
              <path
                d="M15 18L9 12L15 6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 font-pretendard select-none text-center">
            알림 설정
          </h1>
          <div className="w-[41px] h-[41px]" />
        </header>
      }
      className="bg-white"
    >
      <div className="w-full max-w-[402px] mx-auto bg-white flex flex-col">
        {/* 1. 알림 수신 이메일 설정 블록 */}
        <section className="pt-[24px] pl-[20px] pr-[20px] flex flex-col text-left">
          <h2 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800 font-pretendard select-none">
            알람 수신 이메일
          </h2>

          {/* 타이틀과 설명 사이의 4px 간격 */}
          <p className="mt-[4px] text-[12px] font-medium leading-[160%] tracking-normal text-gray-400 font-pretendard select-none">
            맞춤 공고 및 마감일 리마인드 메일을 받을 주소입니다.
          </p>

          {/* 음영(shadow)을 없앤 이메일 박스 (w-362 h-59) */}
          <div className="mt-[24px] w-full max-w-[362px] h-[59px] rounded-[16px] bg-blue-50/50 pt-[15px] pr-[15px] pb-[15px] pl-[20px] flex items-center justify-between transition-all mx-auto">
            {isEditingEmail ? (
              <div className="flex flex-1 items-center justify-between gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-[180px] h-[33px] rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-800 focus:border-blue-500 focus:outline-none"
                  placeholder="이메일 입력"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput(notificationSettings.notificationEmail);
                      setIsEditingEmail(false);
                    }}
                    className="h-[33px] px-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-[12px] text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEmail}
                    className="h-[33px] px-2.5 text-xs font-bold bg-blue-600 rounded-[12px] text-white hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[14px] font-normal leading-[140%] tracking-[-0.24px] text-gray-800 font-pretendard truncate pr-4">
                  {notificationSettings?.notificationEmail || '이메일을 등록해주세요.'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="w-[57px] h-[33px] flex items-center justify-center rounded-[12px] border border-gray-200 bg-white text-xs font-medium text-[12px] leading-[160%] tracking-normal text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
                >
                  변경
                </button>
              </>
            )}
          </div>
        </section>

        {/* 이메일 박스로부터 24px 간격을 둔 앱 푸시 알림 영역 (w-402 h-261) */}
        <section className="mt-[24px] w-full max-w-[402px] h-[261px] flex flex-col bg-white">
          <ul>
            {/* 앱 푸시 알림 */}
            <li className="w-full max-w-[402px] h-[75px] pt-[24px] pr-[20px] pb-[24px] pl-[20px] flex items-center justify-between border-t border-b border-gray-100/80">
              <div className="w-[253px] h-[45px] flex flex-col justify-center text-left">
                <span className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800 font-pretendard select-none">
                  앱 푸시 알림
                </span>
              </div>
              <Switch
                checked={notificationSettings?.pushEnabled}
                onChange={() => handleToggle('pushEnabled')}
              />
            </li>

            {/* 맞춤 공고 추천 알림 (제목과 설명문 사이의 gap: 4px) */}
            <li className="w-full max-w-[402px] h-[75px] pt-[24px] pr-[20px] pb-[24px] pl-[20px] flex items-center justify-between border-b border-gray-100/80">
              <div className="w-[253px] h-[45px] flex flex-col gap-[4px] justify-center text-left">
                <span className="text-[16px] font-medium leading-[140%] tracking-normal text-gray-800 font-pretendard select-none">
                  맞춤 공고 추천 알림
                </span>
                <p className="text-[12px] font-medium text-gray-400 leading-[140%] font-pretendard select-none">
                  내 핏 조건에 맞는 새로운 공고가 등록되면 알려드려요.
                </p>
              </div>
              <Switch
                checked={notificationSettings?.recommendedEnabled}
                onChange={() => handleToggle('recommendedEnabled')}
              />
            </li>

            {/* 마감일 임박 리마인드 (제목과 설명문 사이의 gap: 4px) */}
            <li className="w-full max-w-[402px] h-[75px] pt-[24px] pr-[20px] pb-[24px] pl-[20px] flex items-center justify-between border-b border-gray-100/80">
              <div className="w-[253px] h-[45px] flex flex-col gap-[4px] justify-center text-left">
                <span className="text-[16px] font-medium leading-[140%] tracking-normal text-gray-800 font-pretendard select-none">
                  마감일 임박 리마인드
                </span>
                <p className="text-[12px] font-medium text-gray-400 leading-[140%] font-pretendard select-none">
                  찜한 공고의 마감일 전에 리마인드를 보내드려요.
                </p>
              </div>
              <Switch
                checked={notificationSettings?.reminderEnabled}
                onChange={() => handleToggle('reminderEnabled')}
              />
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
