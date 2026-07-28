import { useToggleSave } from '@/shared/hooks/useToggleSave';

interface HeartButtonProps {
  postingId: number;
  savedId?: number;
  isSaved: boolean;
}

export default function HeartButton({ postingId, savedId, isSaved }: HeartButtonProps) {
  const { mutate, isPending } = useToggleSave(postingId, { savedId });

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
      className="flex items-center justify-center rounded-full p-1.5 transition-all duration-300 hover:bg-slate-50 active:scale-75 disabled:opacity-50"
      aria-label={isSaved ? '북마크 해제' : '북마크 등록'}
    >
      {isSaved ? (
        <svg
          viewBox="0 0 16 14"
          aria-hidden="true"
          className="h-[14px] w-4 transition-all duration-300"
          fill="none"
        >
          <path
            d="M8.00503 14L1.2151 7.55146C-2.47508 3.68234 2.94949 -3.74638 8.00503 2.26366C13.0606 -3.74638 18.4605 3.70813 14.795 7.55146L8.00503 14Z"
            fill="#F95178"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 16 14"
          aria-hidden="true"
          className="h-[14px] w-4 transition-all duration-300"
          fill="none"
        >
          <path
            d="M8.00503 13L1.91343 7.21415C-1.04395 4.11376 3.29454 -1.83362 8.00503 3.09705C12.7155 -1.83362 17.0343 4.13441 14.0966 7.21415L8.00503 13Z"
            stroke="#D9D9D9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      )}
    </button>
  );
}
