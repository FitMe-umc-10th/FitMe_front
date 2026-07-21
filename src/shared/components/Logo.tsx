import fitMeLogo from '@/assets/logo/fitme-logo-home.svg';

type LogoProps = {
  className?: string;
  blink?: boolean; // 커서 깜빡임 on/off
};

export function Logo({ className = 'h-[30px] w-[100px]', blink = false }: LogoProps) {
  return (
    <span className="inline-flex items-center">
      <img src={fitMeLogo} alt="FitMe" className={className} />
      {blink && (
        <span
          className="ml-1 inline-block h-6 w-[3px] rounded-sm bg-blue-600 animate-cursor-blink"
          aria-hidden
        />
      )}
    </span>
  );
}
