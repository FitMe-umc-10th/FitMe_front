interface LogoProps {
  blink?: boolean;
  className?: string;
}

export default function Logo({ blink = false, className = '' }: LogoProps) {
  return (
    <div
      className={`inline-flex items-center font-black text-4xl tracking-tight text-blue-600 ${className}`}
    >
      <span>Fit</span>
      <span className="inline-flex items-center">
        {/* Me. 박스는 정적 */}
        <span className="ml-[0.1em] rounded-lg bg-blue-600 px-[0.2em] text-white">Me.</span>
        {/* 커서만 깜빡 */}
        <span
          className={`ml-[0.12em] inline-block h-[0.82em] w-[0.13em] rounded-sm bg-blue-600 ${
            blink ? 'animate-cursor-blink' : ''
          }`}
          aria-hidden
        />
      </span>
    </div>
  );
}
