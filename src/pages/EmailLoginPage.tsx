import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import Logo from '@/shared/components/Logo';
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

  // 이메일·비번 둘 다 1자 이상이어야 버튼 활성화
  const canSubmit = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    try {
      // auth.ts의 login 함수 호출 (지금은 mock 토큰 반환)
      const { accessToken } = await login({ email, password });
      setAccessToken(accessToken); // authStore에 토큰 저장 → 로그인 상태
      navigate('/'); // 홈으로 (Protected Route가 온보딩 여부 보고 분기)
    } catch {
      // 실패 시 토스트 (지금 mock은 항상 성공이라 안 뜸)
      toastError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-16">
      <div className="mb-10 flex justify-center">
        <Logo blink />
      </div>

      <div className="flex flex-col gap-3">
        <Input value={email} onChange={setEmail} placeholder="이메일" type="email" />
        <Input value={password} onChange={setPassword} placeholder="비밀번호" type="password" />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={keepLogin}
            onChange={(e) => setKeepLogin(e.target.checked)}
          />
          로그인 상태 유지
        </label>
      </div>

      <div className="mt-6">
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={handleLogin}>
          로그인
        </Button>
      </div>
    </div>
  );
}
