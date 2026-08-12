export const getDDayDays = (deadlineStr?: string | null): number | null => {
  if (!deadlineStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 비교를 위해 시분초는 자정으로 통일

  const deadline = new Date(deadlineStr);
  if (Number.isNaN(deadline.getTime())) return null;

  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateDDay = (deadlineStr?: string | null): string => {
  const diffDays = getDDayDays(deadlineStr);
  if (diffDays === null) return 'D-?';
  if (diffDays < 0) return '마감';
  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
};

export const formatKoreanDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return `${year}. ${month}. ${day}. (${weekday})`;
};
