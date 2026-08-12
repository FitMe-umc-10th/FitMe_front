import { calculateDDay, getDDayDays } from '@/shared/utils/date';

interface DayBadgeProps {
  deadline?: string | null;
  variant?: 'default' | 'glass' | 'glassDark' | 'compact' | 'vertical' | 'detail';
}

export default function DayBadge({ deadline, variant = 'default' }: DayBadgeProps) {
  const dDayText = calculateDDay(deadline);
  const dDayDays = getDDayDays(deadline);
  const isUrgent = dDayDays !== null && dDayDays <= 7;
  const coloredTextClass = isUrgent ? 'text-[#F94D0E]' : 'text-[#20D341]';
  const coloredBackgroundClass = isUrgent
    ? 'bg-[#FFE1D3] text-[#F94D0E]'
    : 'bg-[#E5FCE3] text-[#20D341]';

  if (variant === 'glass') {
    return (
      <span className="inline-flex h-[27px] min-w-[45px] flex-none rounded-[118.265px] bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.01)_100%)] p-px">
        <span className={`inline-flex size-full items-center justify-center whitespace-nowrap rounded-[117.265px] bg-white/[0.01] px-3 py-1 text-[12px] font-semibold leading-[160%] tracking-[-0.244565px] backdrop-blur-[10px] [font-family:Pretendard] ${coloredTextClass}`}>
          {dDayText}
        </span>
      </span>
    );
  }

  if (variant === 'glassDark') {
    return (
      <span className="inline-flex h-[22.66px] min-w-[37.97px] flex-none rounded-[98.4189px] bg-[linear-gradient(135deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.01)_100%)] p-px">
        <span className={`inline-flex size-full items-center justify-center whitespace-nowrap rounded-[97.4189px] bg-white/[0.01] px-[9.15px] py-[2.5px] text-[9.9863px] font-semibold leading-[160%] tracking-[-0.203525px] backdrop-blur-[10px] [font-family:Pretendard] ${coloredTextClass}`}>
          {dDayText}
        </span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span className={`inline-flex h-[18.63px] min-w-[30.51px] flex-none items-center justify-center whitespace-nowrap rounded-[107.282px] px-[7.25709px] py-[1.81427px] text-[9.07136px] font-medium leading-[160%] ${coloredBackgroundClass}`}>
        {dDayText}
      </span>
    );
  }

  if (variant === 'vertical') {
    return (
      <span
        className={`inline-flex h-5 min-w-[34px] flex-none items-center justify-center whitespace-nowrap rounded-[118.265px] px-2 py-0.5 text-[10px] font-medium leading-[160%] ${coloredBackgroundClass}`}
      >
        {dDayText}
      </span>
    );
  }

  if (variant === 'detail') {
    return (
      <span className={`inline-flex h-[27.5px] min-w-[52.99px] flex-none items-center justify-center whitespace-nowrap rounded-[162.535px] px-[10.9946px] py-[2.74866px] text-[13.7433px] font-medium leading-[160%] [font-family:Pretendard] ${coloredBackgroundClass}`}>
        {dDayText}
      </span>
    );
  }

  return (
    <span className={`inline-flex h-[22px] min-w-[40px] items-center justify-center whitespace-nowrap rounded-full px-2 text-[11px] font-bold ${coloredBackgroundClass}`}>
      {dDayText}
    </span>
  );
}
