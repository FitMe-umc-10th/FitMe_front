interface ButtonProps {
  variant?: 'primary' | 'secondary'; // 색상 종류
  size?: 'sm' | 'md' | 'lg'; // 크기
  disabled?: boolean; // 비활성화
  onClick?: () => void; // 클릭 시 실행할 함수
  children: React.ReactNode; // 버튼 안 글자 (<Button>로그인</Button>의 "로그인")
}

export default function Button({
  variant = 'primary', // 기본값 = primary
  size = 'md',
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  const base =
    'rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
}
