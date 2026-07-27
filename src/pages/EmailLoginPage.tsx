import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/shared/components/Logo';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { login } from '@/apis/auth';

export default function EmailLoginPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const toastError = useToastStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogin, setKeepLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 이메일·비번 둘 다 1자 이상이어야 버튼 활성화
  const canSubmit = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    try {
      const { accessToken } = await login({ email, password, keepLogin });
      setAccessToken(accessToken);
      navigate('/');
    } catch {
      toastError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col px-5">
      {/* 로고 (상단, 크게) */}
      <div className="flex justify-center pt-[100px]">
        <Logo blink className="h-[81px] w-[213px]" />
      </div>

      {/* 입력 영역 */}
      <div className="mt-[60px] flex flex-col gap-5">
        {/* 이메일 */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="h-12 w-full rounded-[10px] border border-[#0059FF] px-4 text-[16px] text-[#262626] placeholder:text-[#8C8C8C] outline-none"
        />

        {/* 비밀번호 */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="h-12 w-full rounded-[10px] border border-[#0059FF] px-4 pr-11 text-[16px] text-[#262626] placeholder:text-[#8C8C8C] outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label="비밀번호 보기"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* 로그인 상태 유지 */}
        <label className="flex items-center gap-3 text-[16px] text-[#4B5563]">
          <input
            type="checkbox"
            checked={keepLogin}
            onChange={(e) => setKeepLogin(e.target.checked)}
            className="size-6 rounded-lg accent-[#0059FF]"
          />
          로그인 상태 유지
        </label>
      </div>

      {/* 로그인 버튼 (하단 고정) */}
      <div className="absolute inset-x-5 bottom-[46px]">
        <button
          type="button"
          onClick={handleLogin}
          disabled={!canSubmit}
          className={`h-14 w-full rounded-xl text-[18px] font-semibold text-white transition-colors ${
            canSubmit ? 'bg-[#0059FF]' : 'bg-[#D9D9D9]'
          }`}
        >
          로그인
        </button>
      </div>
    </div>
  );
}
