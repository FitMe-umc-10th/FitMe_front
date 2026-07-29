import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '@/shared/components/Logo';
import { useToastStore } from '@/store/toastStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toastError = useToastStore((s) => s.error);

  // 소셜 로그인 실패 시 백엔드가 /login?error=true&code=AUTH401 로 되돌림
  useEffect(() => {
    if (searchParams.get('error') === 'true') {
      toastError('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
      // 주소창의 에러 파라미터 제거
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, toastError]);

  // 우리 앱 내부 이동이 아니라 백엔드(다른 서버)로 완전히 나가는 거라 window.location 사용
  const handleKakaoLogin = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/kakao`;
  };
  const handleNaverLogin = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/naver`;
  };

  return (
    <div className="flex min-h-dvh flex-col px-[19px]">
      {/* 로고 영역 (화면 가운데) */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <Logo blink className="h-[81px] w-[213px]" />
      </div>

      {/* 로그인 버튼 영역 (화면 하단) */}
      <div className="flex flex-col gap-2 pb-10">
        {/* 카카오 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#FEE500] text-[14.7px] font-semibold text-[#181600]"
        >
          <span aria-hidden>💬</span> 카카오 로그인
        </button>

        {/* 네이버 */}
        <button
          type="button"
          onClick={handleNaverLogin}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#03A94D] text-[14.7px] font-semibold text-white"
        >
          <span aria-hidden>N</span> 네이버 로그인
        </button>

        {/* 이메일 로그인 */}
        <button
          type="button"
          onClick={() => navigate('/login/email')}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#ECECEC] text-[14.7px] font-medium text-[#606060]"
        >
          <span aria-hidden>✉️</span> 이메일 로그인
        </button>

        {/* 회원가입 링크 */}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="mt-2 text-[14px] font-medium text-[#535353]"
        >
          처음이신가요? <span className="font-semibold text-[#0059FF]">회원가입</span>
        </button>
      </div>
    </div>
  );
}
