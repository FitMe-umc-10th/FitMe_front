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

export const formatRelativeTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';

  // 이미 상대 시간 형식("2시간 전", "어제" 등)인 경우 그대로 반환
  if (
    dateStr.includes('전') ||
    dateStr.includes('어제') ||
    dateStr.includes('오늘') ||
    dateStr.includes('방금')
  ) {
    return dateStr;
  }

  const targetDate = new Date(dateStr);
  if (Number.isNaN(targetDate.getTime())) {
    return dateStr;
  }

  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

