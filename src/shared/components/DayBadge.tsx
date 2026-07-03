import { calculateDDay } from '@/shared/utils/date';

interface DayBadgeProps {
  deadline: string;
  variant?: 'default' | 'glass';
}

export default function DayBadge({ deadline, variant = 'default' }: DayBadgeProps) {
  const dDayText = calculateDDay(deadline);

  const styleClasses =
    variant === 'glass'
      ? 'bg-white/20 backdrop-blur-md border border-white/30 text-orange-500'
      : 'bg-orange-50 text-orange-500';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styleClasses}`}>
      {dDayText}
    </span>
  );
}
