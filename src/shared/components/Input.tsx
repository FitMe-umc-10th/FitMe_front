import { useState } from 'react';
import eyeIcon from '@/assets/icons/eye.svg';

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

  // 입력 여부에 따라 테두리 색 결정 (시안: 입력 전 회색 → 입력 후 파랑)
  const hasValue = value !== '';
  const borderClass = error
    ? 'border-[#EF4444]'
    : hasValue
      ? 'border-[#0059FF]'
      : 'border-[#D9D9D9]';

  return (
    <div className="w-full">
      <div className="relative">
        {/* SearchableSelect와 동일 스펙 (h 48px · radius 12px · padding 12px 15px · 16px Medium) */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-12 w-full rounded-xl border bg-white px-[15px] text-[16px] font-medium leading-[140%] tracking-[-0.244565px] text-[#262626] outline-none transition-colors
            placeholder:font-medium placeholder:text-[#A5A5A5]
            disabled:cursor-not-allowed disabled:bg-gray-100
            ${borderClass} ${isPassword ? 'pr-11' : ''}`}
        />

        {/* 비밀번호 타입일 때만 눈 토글 버튼 (명세서의 rightSlot 역할) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-[15px] top-1/2 -translate-y-1/2"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <img
              src={eyeIcon}
              alt=""
              aria-hidden="true"
              className={`size-5 ${showPassword ? 'opacity-100' : 'opacity-40'}`}
            />
          </button>
        )}
      </div>

      {/* 에러 있을 때만 문구 표시 */}
      {error && <p className="mt-1 text-[14px] text-[#EF4444]">{error}</p>}
    </div>
  );
}
