import { useNavigate } from 'react-router-dom';
import { Logo } from '@/shared/components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();

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
          onClick={() => alert('카카오 로그인 (연동 예정)')}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-white bg-[#FEE500] text-[14.7px] font-semibold text-[#181600]"
        >
          <span aria-hidden>💬</span> 카카오 로그인
        </button>

        {/* 네이버 */}
        <button
          type="button"
          onClick={() => alert('네이버 로그인 (연동 예정)')}
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
