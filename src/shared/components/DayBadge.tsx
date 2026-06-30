import { calculateDDay } from '@/shared/utils/date';

interface DayBadgeProps {
  deadline: string;
}

export default function DayBadge({ deadline }: DayBadgeProps) {
  const dDayText = calculateDDay(deadline);

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
      {dDayText}
    </span>
  );
}
