import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const setUserName = useAuthStore((s) => s.setUserName);
  const toastError = useToastStore((s) => s.error);

  // StrictMode에서 useEffect 2번 도는 것 방지
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // 성공 시 백엔드가 붙여주는 파라미터
    // ?accessToken=xxx&userId=12&name=홍길동&isOnboarded=false
    const accessToken = searchParams.get('accessToken');
    const name = searchParams.get('name');
    const isOnboarded = searchParams.get('isOnboarded') === 'true';

    // accessToken 없으면 비정상 → 로그인으로
    if (!accessToken) {
      toastError('로그인 정보를 받지 못했습니다. 다시 시도해주세요.');
      navigate('/login', { replace: true });
      return;
    }

    // authStore에 저장 → axios 인터셉터가 이후 요청에 자동 주입
    setAccessToken(accessToken);
    setUserName(name ?? '');
    setOnboarded(isOnboarded);

    // 온보딩 완료면 홈, 아니면 온보딩으로
    navigate(isOnboarded ? '/' : '/onboarding', { replace: true });
  }, [searchParams, navigate, setAccessToken, setUserName, setOnboarded, toastError]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-[14px] text-[#606060]">로그인 처리 중...</p>
    </div>
  );
}
