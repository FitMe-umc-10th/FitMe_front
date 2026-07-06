import { useNavigate } from 'react-router-dom';
import Logo from '@/shared/components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col px-6">
      {/* 로고 영역 (화면 가운데) */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <Logo blink />
      </div>

      {/* 로그인 버튼 영역 (화면 하단) */}
      <div className="flex flex-col gap-3 pb-10">
        {/* 카카오 (브랜드 색이라 커스텀) */}
        <button
          type="button"
          onClick={() => alert('카카오 로그인 (연동 예정)')}
          className="h-12 w-full rounded-lg bg-[#FEE500] font-semibold text-gray-900"
        >
          카카오로 로그인
        </button>

        {/* 네이버 */}
        <button
          type="button"
          onClick={() => alert('네이버 로그인 (연동 예정)')}
          className="h-12 w-full rounded-lg bg-[#03C75A] font-semibold text-white"
        >
          네이버로 로그인
        </button>

        {/* 이메일 로그인 → 이메일 로그인 화면으로 이동 */}
        <button
          type="button"
          onClick={() => navigate('/login/email')}
          className="h-12 w-full rounded-lg bg-gray-100 font-semibold text-gray-800"
        >
          이메일로 로그인
        </button>

        {/* 회원가입 링크 */}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="mt-2 text-sm text-gray-500"
        >
          처음이신가요? <span className="font-semibold text-gray-700">회원가입</span>
        </button>
      </div>
    </div>
  );
}
