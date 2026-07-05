import { useState } from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void; // 입력값이 바뀔 때 부모에게 알림
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string; // 에러 메시지 (있으면 빨간 테두리 + 문구)
  disabled?: boolean;
}

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false); // 비번 보이기 상태

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type; // 토글에 따라 type 바뀜

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors
            ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}
            disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />

        {/* 비밀번호 타입일 때만 눈 토글 버튼 (명세서의 rightSlot 역할) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {/* 에러 있을 때만 문구 표시 */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
