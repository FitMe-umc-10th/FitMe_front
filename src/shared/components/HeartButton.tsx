import { useToggleSave } from '@/shared/hooks/useToggleSave';
import heartFilledIcon from '@/assets/icons/heart-filled.svg';

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
      className="flex items-center justify-center rounded-full p-1.5 transition-all duration-300 hover:bg-slate-50 active:scale-75 disabled:opacity-50"
      aria-label={isSaved ? '북마크 해제' : '북마크 등록'}
    >
      {isSaved ? (
        <span
          aria-hidden="true"
          className="block h-[14px] w-4 bg-[#F95178] transition-all duration-300"
          style={{
            mask: `url(${heartFilledIcon}) center / contain no-repeat`,
            WebkitMask: `url(${heartFilledIcon}) center / contain no-repeat`,
          }}
        />
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
