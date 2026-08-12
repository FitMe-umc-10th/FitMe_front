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
  carouselIndexLabel?: string;
  onSaveFailure?: () => void;
  showSaveErrorToast?: boolean;
}

export default function PostingCard({
  posting,
  variant,
  onClick,
  carouselIndexLabel,
  onSaveFailure,
  showSaveErrorToast,
}: PostingCardProps) {
  const navigate = useNavigate();
  const heartButtonProps = {
    postingId: posting.id,
    savedId: posting.savedId,
    isSaved: posting.isSaved,
    showErrorToast: showSaveErrorToast,
    onError: onSaveFailure,
  };

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
        className="flex h-[204px] w-[162px] shrink-0 cursor-pointer select-none flex-col overflow-hidden rounded-2xl bg-white drop-shadow-[0_0_8px_rgba(0,0,0,0.08)] transition-all duration-200"
      >
        <div className="relative h-[115px] w-[162px] shrink-0 overflow-hidden rounded-t-2xl bg-[#E6EEF8]">
          <PostingThumbnail src={posting.posterUrl} alt={posting.title} type={posting.type} />
        </div>

        <div className="flex h-[89px] w-[162px] flex-col items-start gap-2 rounded-b-2xl bg-white px-3 pb-3 pt-2">
          <div className="flex h-6 w-full items-center justify-between">
            <DayBadge deadline={posting.deadline} variant="vertical" />
            <HeartButton {...heartButtonProps} />
          </div>

          <div className="flex w-full flex-col items-start gap-0.5">
            <h3 className="h-5 w-full truncate text-[14px] font-semibold leading-[140%] text-[#1E1E1E]">
              {posting.title}
            </h3>

            <div className="flex h-[15px] w-full items-center gap-1 text-[10px] font-medium leading-[160%] text-[#A5A5A5]">
              <img src={organizationIcon} alt="" aria-hidden="true" className="size-2.5 shrink-0" />
              <span className="truncate">{posting.organization}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'popular') {
    return (
      <div
        onClick={handleClick}
        className="relative flex h-[202.16px] w-[243px] cursor-pointer select-none flex-col items-end justify-between overflow-hidden rounded-[13.3151px] bg-[#D9F0FF] px-[16.6438px] py-[13.3151px] transition-all duration-300 ease-out"
      >
        <div className="absolute inset-0 z-0 h-full w-full">
          <PostingThumbnail src={posting.posterUrl} alt={posting.title} type={posting.type} />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0)_64.35%)]" />
        </div>

        {carouselIndexLabel && (
          <div className="relative z-10 flex h-[17px] w-[24.98px] items-center justify-center rounded-full bg-[#A5A5A5] px-[5px] text-center text-[8.32192px] font-normal leading-[17px] tracking-[-0.203525px] text-white">
            {carouselIndexLabel}
          </div>
        )}

        <div className="relative z-10 flex h-[91.96px] w-full flex-col items-start gap-[6.66px]">
          <DayBadge deadline={posting.deadline} variant="glassDark" />

          <div className="flex h-[61.3px] w-full flex-col items-start gap-[3.33px]">
            <h3 className="line-clamp-2 h-[38px] w-full text-[13.3151px] font-semibold leading-[140%] text-white">
              {posting.title}
            </h3>

            <div className="flex h-[19.97px] w-full items-center justify-between">
              <div className="flex min-w-0 items-center gap-[4.16px] text-[8.32192px] font-medium leading-[160%] text-[#BFBFBF]">
                <img src={organizationIcon} alt="" aria-hidden="true" className="size-[8.32px] shrink-0" />
                <span className="truncate">{posting.organization}</span>
              </div>

              <div className="flex size-6 shrink-0 items-center justify-center">
                <HeartButton {...heartButtonProps} tone="muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="grid h-[128.01px] w-full max-w-[363px] cursor-pointer select-none grid-cols-[175.14px_187px] gap-0 overflow-hidden rounded-[16px] bg-white drop-shadow-[0_0_8px_rgba(0,0,0,0.08)] transition-all duration-200"
    >
      <div className="h-[128.01px] overflow-hidden rounded-l-[16px] bg-[#E6EEF8]">
        <PostingThumbnail src={posting.posterUrl} alt={posting.title} type={posting.type} />
      </div>

      <div className="flex h-[128px] w-[187px] min-w-0 flex-col items-start justify-center gap-4 rounded-r-[16px] bg-white px-3 py-5">
        <div className="flex h-6 w-[163px] flex-col items-start gap-[50px]">
          <div className="flex h-6 w-[146px] items-center justify-between">
            <DayBadge deadline={posting.deadline} variant="compact" />
            <div className="flex size-6 items-center justify-center [&>button]:p-1">
              <HeartButton {...heartButtonProps} />
            </div>
          </div>
        </div>

        <div className="flex h-[39px] w-[163px] flex-col items-start gap-1">
          <h3 className="h-5 w-[163px] truncate text-[14px] font-semibold leading-[140%] tracking-[-0.241437px] text-[#1E1E1E]">
            {posting.title}
          </h3>

          <div className="flex h-[15px] w-[163.35px] items-center gap-1 text-[10px] font-medium leading-[160%] text-[#A5A5A5]">
            <img src={organizationIcon} alt="" aria-hidden="true" className="size-[12.35px] shrink-0" />
            <span className="w-[147px] truncate">{posting.organization}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
