import { calculateDDay } from '@/shared/utils/date';

interface DayBadgeProps {
  deadline: string;
}

export default function DayBadge({ deadline }: DayBadgeProps) {
  const dDayText = calculateDDay(deadline);

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-500">
      {dDayText}
    </span>
  );
}
