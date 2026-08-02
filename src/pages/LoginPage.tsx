import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '@/shared/components/Logo';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { linkAccount } from '@/apis/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toastError = useToastStore((s) => s.error);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUserName = useAuthStore((s) => s.setUserName);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const handled = useRef(false); // StrictMode 중복 실행 방지

  useEffect(() => {
    if (handled.current) return;
    const error = searchParams.get('error');
    if (!error) return;
    handled.current = true;

    // 소셜 로그인 계정 연동 필요
    if (error === 'REQUIRE_LINK') {
      const message = searchParams.get('message') ?? '기존 계정에 연동하시겠습니까?';
      // linkToken은 쿼리(?)가 아니라 해시(#)로 옴 + 혹시 붙은 따옴표 제거
      const rawHash = window.location.hash.replace(/^#/, '').replace(/['"]/g, '');
      const linkToken = new URLSearchParams(rawHash).get('linkToken');

      if (!linkToken) {
        toastError('연동 토큰을 받지 못했습니다. 다시 시도해주세요.');
        navigate('/login', { replace: true });
        return;
      }

      // 연동 여부 확인 (linkToken 유효시간 3분이라 빨리 결정해야 함)
      if (!window.confirm(message)) {
        navigate('/login', { replace: true });
        return;
      }

      linkAccount(linkToken)
        .then((res) => {
          setAccessToken(res.accessToken);
          setUserName(res.member.name);
          setOnboarded(res.member.isOnboarded);
          navigate(res.member.isOnboarded ? '/' : '/onboarding', { replace: true });
        })
        .catch(() => {
          toastError('계정 연동에 실패했습니다. 다시 시도해주세요.');
          navigate('/login', { replace: true });
        });
      return;
    }

    // 일반 소셜 로그인 실패
    toastError('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
    navigate('/login', { replace: true });
  }, [searchParams, navigate, toastError, setAccessToken, setUserName, setOnboarded]);

  const handleKakaoLogin = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/kakao`;
  };
  const handleNaverLogin = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/naver`;
  };

  return (
    <div className="flex min-h-dvh flex-col px-[19px]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Logo blink className="h-[81px] w-[213px]" />
      </div>
      <div className="flex flex-col gap-2 pb-10">
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#FEE500] text-[14.7px] font-semibold text-[#181600]"
        >
          <span aria-hidden>💬</span> 카카오 로그인
        </button>
        <button
          type="button"
          onClick={handleNaverLogin}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#03A94D] text-[14.7px] font-semibold text-white"
        >
          <span aria-hidden>N</span> 네이버 로그인
        </button>
        <button
          type="button"
          onClick={() => navigate('/login/email')}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#ECECEC] text-[14.7px] font-medium text-[#606060]"
        >
          <span aria-hidden>✉️</span> 이메일 로그인
        </button>
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
