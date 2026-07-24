import { useNavigate } from 'react-router-dom';
import DayBadge from '@/shared/components/DayBadge';
import HeartButton from '@/shared/components/HeartButton';
import PostingThumbnail from '@/shared/components/PostingThumbnail';
import type { Posting } from '@/types/posting';

interface PostingCardProps {
  posting: Posting;
  variant: 'horizontal' | 'vertical' | 'popular';
  onClick?: () => void;
}

export default function PostingCard({ posting, variant, onClick }: PostingCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/postings/${posting.id}`);
    }
  };

  if (variant === 'vertical') {
    return (
      <div
        onClick={handleClick}
        className="flex h-[196px] w-[154px] cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-[#EEF0F3] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.07)] transition-all duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1)]"
      >
        <div className="relative h-[104px] w-full flex-shrink-0 border-b border-[#EEF0F3] bg-[#E6EEF8]">
          <PostingThumbnail src={posting.posterUrl} alt={posting.title} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between px-3 pb-3 pt-2">
          <div className="flex items-center justify-between">
            <DayBadge deadline={posting.deadline} />
            <HeartButton postingId={posting.id} isSaved={posting.isSaved} />
          </div>

          <h3 className="truncate text-[13px] font-bold leading-[1.35] text-[#1F2937]">{posting.title}</h3>

          <div className="flex items-center gap-1 text-[10px] text-[#A1A1A1]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 flex-shrink-0"
            >
              <path d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6" />
            </svg>
            <span className="truncate">{posting.organization}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'popular') {
    return (
      <div
        onClick={handleClick}
        className="relative flex h-[239px] w-[292px] cursor-pointer select-none flex-col justify-end overflow-hidden rounded-[18px] border border-[#EEF0F3] bg-[#D9F0FF] px-5 pb-5 pt-4 shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-all duration-200 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)]"
      >
        <div className="absolute inset-0 -z-10 h-full w-full">
          <PostingThumbnail src={posting.posterUrl} alt={posting.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-white/45 via-white/5 to-transparent" />
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2">
              <DayBadge deadline={posting.deadline} variant="glass" />
            </div>

            <h3 className="mb-2 line-clamp-2 text-[20px] font-extrabold leading-[1.3] text-[#202124]">
              {posting.title}
            </h3>

            <div className="flex items-center gap-1 text-[12px] text-[#6B7280]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 flex-shrink-0"
              >
                <path d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6" />
              </svg>
              <span className="truncate">{posting.organization}</span>
            </div>
          </div>

          <div className="mb-0.5 flex-shrink-0">
            <HeartButton postingId={posting.id} isSaved={posting.isSaved} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex h-[128px] w-full cursor-pointer select-none items-stretch overflow-hidden rounded-2xl border border-[#EEF0F3] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_5px_16px_rgba(15,23,42,0.08)]"
    >
      <div className="relative w-[154px] flex-shrink-0 border-r border-[#EEF0F3] bg-[#E6EEF8]">
        <PostingThumbnail src={posting.posterUrl} alt={posting.title} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-3 py-4">
        <div className="mb-2 flex h-6 w-full items-center justify-between">
          <DayBadge deadline={posting.deadline} />
          <HeartButton postingId={posting.id} isSaved={posting.isSaved} />
        </div>

        <h3 className="mb-1 line-clamp-2 min-h-[40px] text-[14px] font-bold leading-[1.4] text-[#1F2937]">
          {posting.title}
        </h3>

        <div className="mt-auto flex h-[15px] items-center gap-1 text-[11px] text-[#A1A1A1]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 flex-shrink-0"
          >
            <path d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6" />
          </svg>
          <span className="truncate">{posting.organization}</span>
        </div>
      </div>
    </div>
  );
}
