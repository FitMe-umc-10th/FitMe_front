import { calculateDDay } from '@/shared/utils/date';

interface DayBadgeProps {
  deadline?: string | null;
  variant?: 'default' | 'glass';
}

export default function DayBadge({ deadline, variant = 'default' }: DayBadgeProps) {
  const dDayText = calculateDDay(deadline);

  const styleClasses =
    variant === 'glass'
      ? 'bg-white/30 text-[#FF4D16] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] backdrop-blur-md'
      : 'bg-[#FFEAE4] text-[#FF5A1F]';

  return (
    <span className={`inline-flex h-[22px] min-w-[40px] items-center justify-center rounded-full px-2 text-[11px] font-bold ${styleClasses}`}>
      {dDayText}
    </span>
  );
}
