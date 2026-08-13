interface ButtonProps {
  variant?: 'primary' | 'secondary'; // 색상 종류
  size?: 'sm' | 'md' | 'lg'; // 크기
  fullWidth?: boolean; // 가로 꽉 채우기
  disabled?: boolean; // 비활성화
  onClick?: () => void; // 클릭 시 실행할 함수
  children: React.ReactNode; // 버튼 안 글자 (<Button>로그인</Button>의 "로그인")
}

export default function Button({
  variant = 'primary', // 기본값 = primary
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  const base = 'rounded-xl font-semibold transition-colors disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#0059FF] text-white hover:bg-[#0047CC] disabled:bg-[#D9D9D9] disabled:text-white',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-[#D9D9D9]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'h-14 px-6 text-[18px] leading-[140%]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}
