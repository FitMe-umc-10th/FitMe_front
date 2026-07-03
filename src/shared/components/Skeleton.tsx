interface SkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'popular';
}

export default function Skeleton({ count = 1, variant = 'list' }: SkeletonProps) {
  const items = Array.from({ length: count });

  // 세로형 카드 스켈레톤 (variant === 'card')
  if (variant === 'card') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {items.map((_, index) => (
          <div
            key={index}
            className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm w-[162px] h-[204px] overflow-hidden select-none animate-pulse flex-shrink-0"
          >
            {/* 상단: 이미지 골격 */}
            <div className="w-full h-[108px] bg-slate-200 border-b border-slate-100" />

            {/* 하단: 정보 영역 골격 */}
            <div className="flex flex-col flex-1 justify-between p-3 min-w-0">
              {/* 첫 번째 행: 배지 & 하트 버튼 골격 */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-5 bg-slate-100 rounded-full" />
                <div className="w-6 h-6 bg-slate-100 rounded-full" />
              </div>

              {/* 두 번째 행: 제목 골격 */}
              <div className="w-11/12 h-3 bg-slate-200 rounded mt-1.5" />

              {/* 세 번째 행: 기관 골격 */}
              <div className="w-2/3 h-2.5 bg-slate-100 rounded mt-1.5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 실시간 인기 공고 스켈레톤 (variant === 'popular')
  if (variant === 'popular') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {items.map((_, index) => (
          <div
            key={index}
            className="relative flex flex-col justify-between w-[292px] h-[239px] rounded-2xl border border-slate-100 shadow-sm overflow-hidden select-none animate-pulse flex-shrink-0 pt-[16px] pb-[16px] px-[20px]"
          >
            {/* 전체 배경 이미지 슬롯 */}
            <div className="absolute inset-0 bg-slate-200 -z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />

            {/* 상단 빈 영역 */}
            <div className="h-6" />

            {/* 하단 정보 영역 골격 */}
            <div className="flex items-end justify-between gap-4 mt-auto">
              <div className="flex-1 min-w-0">
                {/* 배지 */}
                <div className="w-12 h-5 bg-white/40 border border-white/20 rounded-full mb-2" />
                {/* 제목 */}
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="w-11/12 h-3.5 bg-slate-200 rounded" />
                  <div className="w-8/12 h-3.5 bg-slate-200 rounded" />
                </div>
                {/* 기관 */}
                <div className="w-1/2 h-3 bg-slate-100 rounded" />
              </div>
              {/* 하트 버튼 */}
              <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 가로형 리스트 스켈레톤 (variant === 'list')
  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((_, index) => (
        <div
          key={index}
          className="flex gap-[24px] bg-white rounded-2xl border border-slate-100 shadow-sm w-full h-[128px] overflow-hidden select-none items-stretch animate-pulse"
        >
          {/* 좌측: 포스터 이미지 골격 */}
          <div className="w-36 flex-shrink-0 bg-slate-200 border-r border-slate-100" />

          {/* 우측: 정보 영역 골격 */}
          <div className="flex flex-col flex-1 pt-[24.5px] pb-[9.5px] px-[12px] min-w-0">
            {/* 상단: 배지 & 하트 버튼 골격 */}
            <div className="flex items-center justify-between w-full h-6 mb-[16px]">
              <div className="w-12 h-5 bg-slate-100 rounded-full" />
              <div className="w-6 h-6 bg-slate-100 rounded-full" />
            </div>

            {/* 중간: 제목 골격 (2줄 라인) */}
            <div className="flex flex-col gap-1.5 mb-[4px] flex-1">
              <div className="w-11/12 h-3 bg-slate-200 rounded" />
              <div className="w-8/12 h-3 bg-slate-200 rounded" />
            </div>

            {/* 하단: 주최 기관 골격 */}
            <div className="w-2/3 h-3 bg-slate-100 rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
