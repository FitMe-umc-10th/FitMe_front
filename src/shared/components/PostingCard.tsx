import { useNavigate } from 'react-router-dom';
import DayBadge from '@/shared/components/DayBadge';
import HeartButton from '@/shared/components/HeartButton';
import type { Posting } from '@/types/posting';

interface PostingCardProps {
  posting: Posting;
  variant: 'horizontal' | 'vertical';
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

  // 세로형 (vertical) 레이아웃 - Figma 시안(162x204px, Radius 16px) 반영
  if (variant === 'vertical') {
    return (
      <div
        onClick={handleClick}
        className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-[162px] h-[208px] select-none overflow-hidden"
      >
        {/* 상단: 포스터 이미지 (높이 108px 고정) */}
        <div className="relative w-full h-[115px] bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <img
            src={posting.posterUrl}
            alt={posting.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* 하단: 정보 영역 (높이 자동 분배 및 p-3 패딩) */}
        <div className="flex flex-col flex-1 justify-between pt-2 pb-3 px-3 min-w-0">
          {/* 첫 번째 행: 배지 & 하트 버튼 */}
          <div className="flex items-center justify-between pb-2">
            <DayBadge deadline={posting.deadline} />
            <HeartButton postingId={posting.id} isSaved={posting.isSaved} />
          </div>

          {/* 두 번째 행: 제목 (한 줄 말줄임 처리, 모바일에 맞춘 폰트 크기) */}
          <h3 className="font-bold text-slate-800 text-xs truncate">{posting.title}</h3>

          {/* 세 번째 행: 기관 */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 flex-shrink-0"
            >
              <path d="M3 9l9-6 9 6M5 9h14M6 9v11M18 9v11M4 20h16M10 20v-6h4v6" />
            </svg>
            <span className="truncate">{posting.organization}</span>
          </div>
        </div>
      </div>
    );
  }

  // 가로형 (horizontal) 레이아웃 - 피그마의 여백 감각(Padding, Gap)을 유지하되 가로폭은 유연하게 반응하는 레이아웃
  return (
    <div
      onClick={handleClick}
      className="flex gap-[12px] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full h-[128px] select-none overflow-hidden items-stretch"
    >
      {/* 좌측: 포스터 이미지 (폭 144px 고정, 세로 128px 상속) */}
      <div className="relative w-44 flex-shrink-0 bg-slate-50 border-r border-slate-100">
        <img
          src={posting.posterUrl}
          alt={posting.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* 우측: 정보 영역 (flex-1로 화면 크기에 맞춰 가로가 유연하게 반응) */}
      <div className="flex flex-col flex-1 py-[24.5px] pr-[12px] min-w-0">
        {/* 상단: D-Day 배지 & 하트 버튼 (높이 24px, 다음 요소와 16px 간격) */}
        <div className="flex items-center justify-between w-full h-6 mb-[16px]">
          <DayBadge deadline={posting.deadline} />
          <HeartButton postingId={posting.id} isSaved={posting.isSaved} />
        </div>

        {/* 중간: 공고명 (Figma Pretendard 14px, Line-height 140%, tracking -0.24px, 다음 요소와 4px 간격) */}
        <h3 className="font-['Pretendard'] font-semibold text-[14px] leading-[1.4] tracking-[-0.24px] text-slate-800 line-clamp-2 mb-[4px] truncate">
          {posting.title}
        </h3>

        {/* 하단: 주최 기관 (높이 15px) */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 h-[15px]">
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
