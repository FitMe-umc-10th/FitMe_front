export const getDDayDays = (deadlineStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 비교를 위해 시분초는 자정으로 통일

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateDDay = (deadlineStr: string): string => {
  const diffDays = getDDayDays(deadlineStr);
  if (diffDays < 0) return '마감';
  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
};
