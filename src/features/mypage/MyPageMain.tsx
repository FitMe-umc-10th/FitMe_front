import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/apis/mypage';
import { getAnnouncements } from '@/apis/announcements';
import { Layout, TabBar } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';
import exclamationBorder from '@/assets/exclamation_mark_border.svg';
import exclamationStick from '@/assets/exclamation_mark_stick.svg';
import exclamationDot from '@/assets/exclamation_mark_dot.svg';
import { requestWithdrawal } from '@/apis/withdrawal';

export default function MyPageMain() {
  const navigate = useNavigate();
  const toast = useToastStore();

  // 로컬 모달 팝업 상태 정의 (공통 모달 코드 영향 최소화)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  // 1. 유저 프로필 데이터 조회
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  // 2. 공지사항 조회 (새 공지사항 N 배지 표시용)
  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: getAnnouncements,
  });

  const hasNewNotice = notices?.some((notice) => notice.isNew) ?? false;

  // 장학금 포맷팅 함수 (원 -> 만원)
  const formatScholarship = (amount: number) => {
    const tenThousand = Math.floor(amount / 10000);
    return `${tenThousand}만원`;
  };

  // 로그아웃 버튼 핸들러
  const handleLogoutClick = () => {
    setIsLogoutOpen(true);
  };

  // 회원탈퇴 버튼 핸들러
  const handleWithdrawalClick = () => {
    setIsWithdrawalOpen(true);
  };

  // 로딩 상태 (레이아웃 깜빡임과 밀림을 방지하기 위한 완성형 스켈레톤 Shimmer UI)
  if (isLoading || !profile) {
    return (
      <Layout tabBar={<TabBar />} className="bg-slate-50/50">
        <div className="animate-pulse">
          {/* 프로필 카드 스켈레톤 (높이 377px, 전체 너비) */}
          <div className="w-full h-[377px] bg-slate-900/10" />

          {/* 나머지 하단 영역 스켈레톤 (좌우 패딩 20px) */}
          <div className="space-y-6 px-[20px] pb-6 pt-7">
            {/* 활동 요약 스켈레톤 */}
            <div className="space-y-2.5">
              <div className="h-[25px] w-32 rounded bg-gray-200" />
              <div className="w-full max-w-[362px] h-[78px] rounded-[8px] bg-gray-100 mx-auto" />
            </div>
            {/* 설정 메뉴 스켈레톤 */}
            <div className="space-y-2.5">
              <div className="h-[25px] w-20 rounded bg-gray-100" />
              <div className="w-full max-w-[362px] h-[104px] flex flex-col justify-between mx-auto">
                <div className="h-[24px] w-full rounded bg-gray-100/80" />
                <div className="h-[24px] w-full rounded bg-gray-100/80" />
                <div className="h-[24px] w-full rounded bg-gray-100/80" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout tabBar={<TabBar />} className="bg-slate-50/50">
      <div>
        {/* 1. 프로필 카드 (전체 화면 상단 배치, 높이 377px) */}
        <section className="relative w-full h-[377px] bg-slate-950 text-white px-5 py-6 flex flex-col justify-between overflow-hidden">
          {/* 선명한 배경 이미지 (opacity: 0.5, 블러 없음) */}
          <div
            style={{ backgroundImage: `url(${profile.profile.profileImageUrl})`, opacity: 0.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          />

          {/* 데코레이션 그라데이션 원 */}
          <div className="absolute -right-6 -top-6 size-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none z-0" />

          {/* 상단: "마이페이지" 흰색 글자 */}
          <div className="relative z-10 pt-4">
            <h2 className="text-xl font-semibold tracking-tight text-white">마이페이지</h2>
          </div>

          {/* 하단: 유저 정보 및 수정 버튼 */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-medium tracking-tight text-white">
                {profile.profile.name}
              </h3>
              <p className="text-sm font-medium text-slate-300">
                {/* 임시로 22학번으로 표시 */}
                {profile.profile.universityName} | 22학번
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/my/profile')}
                className="w-[63px] h-[22px] rounded-full bg-white text-gray-800 text-[9.5px] font-medium tracking-tighter flex items-center justify-center pt-[3px] pr-[6px] pb-[3px] pl-[6px] gap-[3px] shadow-sm transition-all hover:bg-gray-50 active:scale-95 focus:outline-none"
              >
                내 정보 수정
              </button>
            </div>
          </div>
        </section>

        {/* 2. 나의 활동 요약 (좌우 패딩 20px 컨테이너) */}
        <div className="space-y-6 px-[20px] pb-6 pt-7">
          <section className="space-y-2.5">
            <h3 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800">
              나의 활동 요약
            </h3>
            <div className="w-full max-w-[362px] h-[78px] rounded-[8px] pt-[15px] pr-[32.5px] pb-[15px] pl-[32.5px] flex items-center justify-between border border-gray-100 bg-white shadow-sm mx-auto">
              {/* 지원 완료 */}
              <div className="flex flex-col items-center justify-center w-[38px] h-[48px] gap-[7px] text-center">
                <p className="text-xs font-medium text-gray-400 whitespace-nowrap">지원 완료</p>
                <p className="text-base font-bold text-gray-800 leading-none">
                  {profile.activitySummary.completedApplicationCount}회
                </p>
              </div>

              {/* 세로 구분선 1 */}
              <div className="w-[0.5px] h-[37px] bg-gray-200/80 pointer-events-none" />

              {/* 누적 장학금 */}
              <div className="flex flex-col items-center justify-center w-[65px] h-[48px] gap-[7px] text-center">
                <p className="text-xs font-medium text-gray-400 whitespace-nowrap">누적 장학금</p>
                <p className="text-base font-bold text-blue-600 leading-none">
                  {formatScholarship(profile.activitySummary.totalScholarshipAmount || 0)}
                </p>
              </div>

              {/* 세로 구분선 2 */}
              <div className="w-[0.5px] h-[37px] bg-gray-200/80 pointer-events-none" />

              {/* 결과 대기 */}
              <div className="flex flex-col items-center justify-center w-[38px] h-[48px] gap-[7px] text-center">
                <p className="text-xs font-medium text-gray-400 whitespace-nowrap">결과 대기</p>
                <p className="text-base font-bold text-gray-800 leading-none">
                  {profile.activitySummary.pendingResultCount}건
                </p>
              </div>
            </div>
          </section>

          {/* 3. 일반 설정 */}
          <section className="space-y-0 mt-[24px]">
            <h3 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800">
              일반 설정
            </h3>
            <div className="w-full max-w-[362px] flex flex-col mt-[16px] px-1 mx-auto">
              {/* 알림 설정 */}
              <button
                type="button"
                onClick={() => navigate('/my/notifications')}
                className="w-full h-[24px] flex items-center justify-between hover:opacity-75 active:opacity-60 transition-opacity text-left focus:outline-none"
              >
                <span className="text-sm font-semibold text-gray-800">알림 설정</span>
                <svg
                  className="size-4.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 공지사항 */}
              <button
                type="button"
                onClick={() => navigate('/my/notices')}
                className="w-full h-[24px] flex items-center justify-between mt-[16px] hover:opacity-75 active:opacity-60 transition-opacity text-left focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">공지사항</span>
                  {hasNewNotice && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      N
                    </span>
                  )}
                </div>
                <svg
                  className="size-4.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 고객센터 및 문의 */}
              <button
                type="button"
                onClick={() => navigate('/my/support')}
                className="w-full h-[24px] flex items-center justify-between mt-[18px] hover:opacity-75 active:opacity-60 transition-opacity text-left focus:outline-none"
              >
                <span className="text-sm font-semibold text-gray-800">고객센터 및 문의</span>
                <svg
                  className="size-4.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>

          {/* 4. 로그아웃 및 회원탈퇴 푸터 버튼 */}
          <div className="flex items-center justify-center gap-3 mt-[36px] pb-6 text-xs font-semibold text-gray-400">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="hover:text-gray-600 active:text-gray-800 transition-colors"
            >
              로그아웃
            </button>
            <span className="text-gray-200 select-none">|</span>
            <button
              type="button"
              onClick={handleWithdrawalClick}
              className="hover:text-gray-600 active:text-gray-800 transition-colors"
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 커스텀 로컬 모달 렌더링 영역 (피그마 픽셀 스펙 일치) */}
      {/* ======================================================== */}

      {/* 1. 로그아웃 모달 (w-323, h-177) */}
      {isLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
          <div className="absolute inset-0" onClick={() => setIsLogoutOpen(false)} />
          <section
            role="dialog"
            aria-modal="true"
            className="relative w-[323px] h-[177px] rounded-[24px] bg-white pt-[24px] pb-[24px] px-[20px] flex flex-col justify-between items-center text-center shadow-2xl animate-fade-in-up"
          >
            <div className="flex flex-col items-center w-full">
              <h2 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-900 text-center">
                로그아웃 하시겠어요?
              </h2>
              <p className="mt-[16px] text-[16px] font-normal leading-[140%] tracking-[-2%] text-gray-400 text-center">
                로그아웃 시 맞춤 공고 알림이 제한됩니다.
              </p>
            </div>

            <div className="flex gap-[8px] justify-center w-full mt-auto">
              <button
                type="button"
                onClick={() => setIsLogoutOpen(false)}
                className="w-[144px] h-[42px] flex items-center justify-center rounded-[8px] text-[16px] font-medium leading-[140%] tracking-normal text-center transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutOpen(false);
                  toast.success('로그아웃 되었습니다.');
                }}
                className="w-[144px] h-[42px] flex items-center justify-center rounded-[8px] text-[16px] font-medium leading-[140%] tracking-normal text-center transition-all bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              >
                로그아웃
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 2. 회원탈퇴 모달 (w-323, h-323) */}
      {isWithdrawalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
          <div className="absolute inset-0" onClick={() => setIsWithdrawalOpen(false)} />
          <section
            role="dialog"
            aria-modal="true"
            className="relative w-[323px] h-[323px] rounded-[24px] bg-white pt-[24px] pb-[24px] px-[20px] flex flex-col justify-between items-center text-center shadow-2xl animate-fade-in-up"
          >
            <div className="flex flex-col items-center w-full">
              {/* 느낌표 에셋 이미지 결합형 (높이 55px, 느낌표 밑 gap 16px) */}
              <div className="relative size-[55px] flex items-center justify-center select-none mb-[16px] shrink-0">
                <img src={exclamationBorder} className="absolute inset-0 size-full" alt="" />
                <img
                  src={exclamationStick}
                  className="absolute top-[14px]"
                  style={{ left: 'calc(50% - 2.5px)' }}
                  alt=""
                />
                <img
                  src={exclamationDot}
                  className="absolute bottom-[14px]"
                  style={{ left: 'calc(50% - 3.0px)' }}
                  alt=""
                />
              </div>

              <h2 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-900 text-center">
                정말 탈퇴하시겠어요?
              </h2>
              {/* 타이틀 밑 gap 16px */}
              <p className="mt-[16px] text-[16px] font-normal leading-[140%] tracking-[-2%] text-gray-400 text-center whitespace-pre-line">
                {`지금 탈퇴하시면 ${profile?.profile.name}님이 모은\n아래 데이터가 영구적으로 삭제됩니다.`}
              </p>
            </div>

            {/* 삭제 예정 데이터 박스 (w-238, h-42, 패딩 상하 10px 좌우 50px, gap 16px) */}
            <div className="w-[238px] h-[42px] py-[10px] px-[50px] whitespace-nowrap rounded-[8px] bg-[#f0f6ff] text-blue-600 flex items-center justify-center select-none border border-blue-100/30 text-[16px] font-semibold leading-[140%] tracking-normal text-center mt-[16px] mx-auto">
              누적 장학금 {formatScholarship(profile?.activitySummary?.totalScholarshipAmount || 0)}
            </div>

            {/* 박스 밑 gap 24px 및 버튼 두께 font-medium 보정 */}
            <div className="flex gap-[8px] justify-center w-full mt-[24px]">
              <button
                type="button"
                onClick={() => setIsWithdrawalOpen(false)}
                className="w-[144px] h-[42px] flex items-center justify-center rounded-[8px] text-[16px] font-medium leading-[140%] tracking-normal text-center transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWithdrawalOpen(false);
                  requestWithdrawal();
                  toast.error('회원 탈퇴가 완료되었습니다.');
                }}
                className="w-[144px] h-[42px] flex items-center justify-center rounded-[8px] text-[16px] font-medium leading-[140%] tracking-normal text-center transition-all bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              >
                탈퇴하기
              </button>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
