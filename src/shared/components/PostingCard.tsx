import { useNavigate } from 'react-router-dom';
import organizationIcon from '@/assets/icons/organization.svg';
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
            <img src={organizationIcon} alt="" aria-hidden="true" className="size-3 shrink-0" />
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
              <img src={organizationIcon} alt="" aria-hidden="true" className="size-3.5 shrink-0" />
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
      className="grid h-[128px] cursor-pointer select-none grid-cols-[176px_187px] gap-0 bg-white transition-all duration-200"
    >
      <div className="h-[128px] overflow-hidden rounded-l-[16px] bg-[#E6EEF8]">
        <PostingThumbnail src={posting.posterUrl} alt={posting.title} />
      </div>

      <div className="relative h-[128px] w-[187px] min-w-0 bg-white px-3 py-5">
        <div className="absolute left-3 top-[22px]">
          <DayBadge deadline={posting.deadline} />
        </div>

        <div className="absolute right-3 top-[22px]">
          <HeartButton postingId={posting.id} isSaved={posting.isSaved} />
        </div>

        <h3 className="absolute left-3 right-3 top-[67.14px] truncate text-[14px] font-bold leading-[19px] text-[#262626]">
          {posting.title}
        </h3>

        <div className="absolute left-3 right-3 top-[92.86px] flex items-center gap-[3px] text-[11px] font-medium leading-none text-[#A5A5A5]">
          <img src={organizationIcon} alt="" aria-hidden="true" className="size-[13px] shrink-0" />
          <span className="truncate">{posting.organization}</span>
        </div>
      </div>
    </div>
  );
}
