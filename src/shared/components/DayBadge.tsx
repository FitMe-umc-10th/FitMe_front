import { calculateDDay, getDDayDays } from '@/shared/utils/date';

interface DayBadgeProps {
  deadline?: string | null;
  variant?: 'default' | 'glass' | 'glassDark' | 'compact' | 'vertical' | 'detail';
}

export default function DayBadge({ deadline, variant = 'default' }: DayBadgeProps) {
  const dDayText = calculateDDay(deadline);
  const dDayDays = getDDayDays(deadline);

  if (variant === 'glass') {
    return (
      <span className="inline-flex h-[27px] w-[45px] flex-none items-center justify-center whitespace-nowrap rounded-[13.5px] bg-black/[0.01] px-3 py-1 text-[12px] font-semibold leading-[160%] tracking-[-0.244565px] text-[#F94D0E] [font-family:Pretendard]">
        {dDayText}
      </span>
    );
  }

  if (variant === 'glassDark') {
    return (
      <span className="inline-flex h-6 min-w-[46px] flex-none items-center justify-center whitespace-nowrap rounded-[118.265px] bg-black/[0.01] px-3 py-1 text-[9.9863px] font-semibold leading-[160%] tracking-[-0.203525px] text-[#20D341] [font-family:Pretendard]">
        {dDayText}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span className="inline-flex h-[18.63px] min-w-[30.51px] flex-none items-center justify-center whitespace-nowrap rounded-[107.282px] bg-[#FFE1D3] px-[7.25709px] py-[1.81427px] text-[9.07136px] font-medium leading-[160%] text-[#F94D0E]">
        {dDayText}
      </span>
    );
  }

  if (variant === 'vertical') {
    const isRelaxedDeadline = dDayDays !== null && dDayDays >= 30;

    return (
      <span
        className={`inline-flex h-5 min-w-[34px] flex-none items-center justify-center whitespace-nowrap rounded-[118.265px] px-2 py-0.5 text-[10px] font-medium leading-[160%] ${
          isRelaxedDeadline ? 'bg-[#E5FCE3] text-[#20D341]' : 'bg-[#FFE1D3] text-[#F94D0E]'
        }`}
      >
        {dDayText}
      </span>
    );
  }

  if (variant === 'detail') {
    return (
      <span className="inline-flex h-[27.5px] min-w-[52.99px] flex-none items-center justify-center whitespace-nowrap rounded-[162.535px] bg-[#E5FCE3] px-[10.9946px] py-[2.74866px] text-[13.7433px] font-medium leading-[160%] text-[#20D341] [font-family:Pretendard]">
        {dDayText}
      </span>
    );
  }

  return (
    <span className="inline-flex h-[22px] min-w-[40px] items-center justify-center whitespace-nowrap rounded-full bg-[#FFEAE4] px-2 text-[11px] font-bold text-[#FF5A1F]">
      {dDayText}
    </span>
  );
}
