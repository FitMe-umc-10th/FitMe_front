import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUserId = useAuthStore((s) => s.setUserId);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const setUserName = useAuthStore((s) => s.setUserName);
  const toastError = useToastStore((s) => s.error);

  // StrictMode에서 useEffect가 2번 실행되는 것 방지
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // ─────────────────────────────────────────────────────────────
    // 백엔드가 보내는 실제 콜백 형태 (2026.08 기준)
    //   /oauth2/callback?isOnboarded=false`#accessToken`=eyJhbGci...
    //
    // 주의할 점 2가지
    //  1) accessToken은 쿼리(?)가 아니라 해시(#)로 온다
    //  2) 값 사이에 백틱(`)이 끼어 오는 백엔드 버그가 있고,
    //     브라우저가 이 백틱을 %60으로 인코딩해버린다
    //     → URLSearchParams로 파싱하면 키가 "accessToken%60"이 되어 값을 못 찾음
    //
    // 그래서 URL 전체를 디코딩한 뒤 정규식으로 값만 직접 추출한다.
    // (쿼리/해시 어디에 있든, 백틱·따옴표가 섞여 있든 잡힌다)
    // ※ 백엔드에서 백틱이 제거되면 이 방어 로직은 단순화 가능
    // ─────────────────────────────────────────────────────────────
    const raw = decodeURIComponent(window.location.href);

    // key 뒤/= 앞에 백틱·따옴표·공백이 붙어도 허용하고, 값만 뽑아낸다
    const pick = (key: string) => {
      const matched = raw.match(new RegExp(`${key}["'\`\\s]*=["'\`\\s]*([^&#\\s"'\`]+)`));
      return matched ? matched[1] : null;
    };

    const getUserIdFromToken = (token: string) => {
      try {
        const [, payload] = token.split('.');
        const decodedPayload = JSON.parse(atob(payload)) as { sub?: string };
        const parsedUserId = Number(decodedPayload.sub);
        return Number.isNaN(parsedUserId) ? null : parsedUserId;
      } catch {
        return null;
      }
    };

    const accessToken = pick('accessToken');
    const isOnboarded = pick('isOnboarded') === 'true';
    const name = pick('name') ?? ''; // 현재 백엔드가 name을 안 보내므로 보통 빈 값

    // 토큰이 없으면 비정상 → 로그인 화면으로 되돌림
    if (!accessToken) {
      toastError('로그인 정보를 받지 못했습니다. 다시 시도해주세요.');
      navigate('/login', { replace: true });
      return;
    }

    // 전역 상태 저장 → 이후 API 요청에 axios 인터셉터가 토큰 자동 주입
    setAccessToken(accessToken);
    setUserId(getUserIdFromToken(accessToken));
    setUserName(name);
    setOnboarded(isOnboarded);

    // 온보딩 완료면 홈, 미완료면 온보딩으로 (replace: 뒤로가기로 콜백 재진입 방지)
    navigate(isOnboarded ? '/' : '/onboarding', { replace: true });
  }, [navigate, setAccessToken, setUserId, setUserName, setOnboarded, toastError]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-[14px] text-[#606060]">로그인 처리 중...</p>
    </div>
  );
}
