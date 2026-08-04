import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const setUserName = useAuthStore((s) => s.setUserName);
  const toastError = useToastStore((s) => s.error);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // 실제 콜백: /oauth2/callback?isOnboarded=false`#accessToken`=eyJ...
    // accessToken은 해시(#), isOnboarded는 쿼리(?)로 옴 + 백틱/따옴표 제거
    const cleanHash = window.location.hash.replace(/^#/, '').replace(/[`'"]/g, '');
    const cleanQuery = window.location.search.replace(/^\?/, '').replace(/[`'"]/g, '');
    const hashParams = new URLSearchParams(cleanHash);
    const queryParams = new URLSearchParams(cleanQuery);

    // 어느 쪽에 오든 잡히게 둘 다 확인
    const accessToken = hashParams.get('accessToken') ?? queryParams.get('accessToken');
    const isOnboarded =
      (queryParams.get('isOnboarded') ?? hashParams.get('isOnboarded')) === 'true';
    const name = queryParams.get('name') ?? hashParams.get('name') ?? '';

    if (!accessToken) {
      toastError('로그인 정보를 받지 못했습니다. 다시 시도해주세요.');
      navigate('/login', { replace: true });
      return;
    }

    setAccessToken(accessToken);
    setUserName(name);
    setOnboarded(isOnboarded);
    navigate(isOnboarded ? '/' : '/onboarding', { replace: true });
  }, [navigate, setAccessToken, setUserName, setOnboarded, toastError]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-[14px] text-[#606060]">로그인 처리 중...</p>
    </div>
  );
}
