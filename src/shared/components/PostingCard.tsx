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
  carouselActive?: boolean;
}

export default function PostingCard({
  posting,
  variant,
  onClick,
  carouselIndexLabel,
  onSaveFailure,
  showSaveErrorToast,
  carouselActive = false,
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
        className="flex h-[204px] w-[162px] shrink-0 cursor-pointer select-none flex-col overflow-hidden rounded-2xl bg-white shadow-[0_0_8px_0_#00000014] transition-all duration-200"
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
        className={`relative flex cursor-pointer select-none flex-col items-end justify-between overflow-hidden bg-[#D9F0FF] ${
          carouselActive
            ? 'h-[239px] w-[292px] rounded-2xl px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]'
            : 'h-[200.82px] w-[243px] rounded-[13.3151px] px-[16.6438px] py-[13.3151px]'
        }`}
      >
        <div className="absolute inset-0 z-0 h-full w-full">
          <PostingThumbnail src={posting.posterUrl} alt={posting.title} type={posting.type} />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0)_64.35%)]" />
        </div>

        {carouselIndexLabel && (
          <div className={`relative z-10 flex items-center justify-center rounded-full bg-[#A5A5A5] text-center font-normal text-white ${
            carouselActive
              ? 'h-5 w-7 px-[5px] text-[10px] leading-5 tracking-[-0.244565px]'
              : 'h-[17px] w-[24.98px] px-[5px] text-[8.32192px] leading-[17px] tracking-[-0.203525px]'
          }`}>
            {carouselIndexLabel}
          </div>
        )}

        <div className={`relative z-10 flex w-full flex-col items-start ${carouselActive ? 'h-[107px] gap-2' : 'h-[90.62px] gap-[6.66px]'}`}>
          <DayBadge deadline={posting.deadline} variant={carouselActive ? 'glass' : 'glassDark'} />

          <div className={`flex w-full flex-col items-start ${carouselActive ? 'h-[72px] gap-1' : 'h-[61.3px] gap-[3.33px]'}`}>
            <h3 className={`line-clamp-2 w-full font-semibold leading-[140%] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] ${carouselActive ? 'h-11 text-[16px]' : 'h-[38px] text-[13.3151px]'}`}>
              {posting.title}
            </h3>

            <div className="flex h-[19.97px] w-full items-center justify-between">
              <div className={`flex min-w-0 items-center font-medium leading-[160%] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] ${carouselActive ? 'gap-[5px] text-[10px]' : 'gap-[4.16px] text-[8.32192px]'}`}>
                <img src={organizationIcon} alt="" aria-hidden="true" className={`${carouselActive ? 'size-2.5' : 'size-[8.32px]'} shrink-0 brightness-0 invert`} />
                <span className="truncate">{posting.organization}</span>
              </div>

              <div className="flex size-6 shrink-0 items-center justify-center">
                <HeartButton {...heartButtonProps} />
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
      className="grid h-[128.01px] w-full max-w-[363px] cursor-pointer select-none grid-cols-[175.14px_187px] gap-0 overflow-hidden rounded-[16px] bg-white shadow-[0_0_8px_0_#00000014] transition-all duration-200"
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

        <div className="flex h-[39px] w-[146px] flex-col items-start gap-1">
          <h3 className="h-5 w-[146px] truncate text-[14px] font-semibold leading-[140%] tracking-[-0.241437px] text-[#1E1E1E]">
            {posting.title}
          </h3>

          <div className="flex h-[15px] w-[146px] min-w-0 items-center gap-1 text-[10px] font-medium leading-[160%] text-[#A5A5A5]">
            <img src={organizationIcon} alt="" aria-hidden="true" className="size-[12.35px] shrink-0" />
            <span className="min-w-0 flex-1 truncate">{posting.organization}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
