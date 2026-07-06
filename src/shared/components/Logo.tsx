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
      <span className={`inline-flex items-center ${blink ? 'animate-blink-slow' : ''}`}>
        <span className="ml-[0.1em] rounded-lg bg-blue-600 px-[0.2em] text-white">Me.</span>
        {/* 커서: em 단위라 글자 크기 따라 자동 비례 */}
        <span
          className="ml-[0.12em] inline-block h-[0.82em] w-[0.13em] rounded-sm bg-blue-600"
          aria-hidden
        />
      </span>
    </div>
  );
}
