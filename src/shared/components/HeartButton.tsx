import { useToggleSave } from '@/shared/hooks/useToggleSave';

interface HeartButtonProps {
  postingId: number;
  isSaved: boolean;
}

export default function HeartButton({ postingId, isSaved }: HeartButtonProps) {
  const { mutate, isPending } = useToggleSave(postingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 카드 클릭 상세 이동과 찜하기 클릭이 겹치지 않게 방지

    if (isPending) return;
    mutate(isSaved);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:bg-slate-50 cursor-pointer active:scale-75 disabled:opacity-50`}
      aria-label={isSaved ? '북마크 해제' : '북마크 등록'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`w-6 h-6 transition-all duration-300 ${
          isSaved 
            ? 'fill-red-500 stroke-red-500 scale-110 drop-shadow-[0_2px_4px_rgba(239,68,68,0.2)]' 
            : 'fill-none stroke-slate-400 hover:stroke-slate-600'
        }`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
