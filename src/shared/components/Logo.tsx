import fitMeLogo from '@/assets/logo/fitme-logo-home.svg';

type LogoProps = {
  className?: string;
};

export function Logo({ className = 'h-[30px] w-[100px]' }: LogoProps) {
  return <img src={fitMeLogo} alt="FitMe" className={className} />;
}
