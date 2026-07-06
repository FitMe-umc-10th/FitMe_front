import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import Logo from '@/shared/components/Logo';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

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
      // TODO: 실제 로그인 API(FIT-LGN-02)로 교체
      // const { data } = await login({ email, password });
      // setAccessToken(data.accessToken);

      // --- Mock (백엔드 나오기 전) ---
      setAccessToken('mock-access-token');
      navigate('/'); // 로그인 성공 → 홈
    } catch {
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
