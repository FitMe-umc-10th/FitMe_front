import emptySavedAnnounce from '@/assets/empty_saved_announce.svg';
import emptyMatchedList from '@/assets/empty_matched_list.svg';
import emptyBookmarkedListFlag from '@/assets/empty_Bookmarked_list_flag.svg';
import emptyBookmarkedListDot from '@/assets/empty_Bookmarked_list_dot.svg';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  illustration?: 'heart-plus' | 'heart-wave' | 'bookmark' | 'none';
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  message,
  subMessage,
  illustration = 'none',
  cta,
}: EmptyStateProps) {
  // SVG 일러스트 분기 렌더링 (에셋 폴더의 실물 아이콘 연동)
  const renderIllustration = () => {
    switch (illustration) {
      case 'heart-plus':
        return (
          <img
            src={emptyMatchedList}
            className="w-[103px] h-[84px] mb-4 object-contain"
            alt="조건에 맞는 공고가 없어요"
          />
        );
      case 'heart-wave':
        return (
          <img
            src={emptySavedAnnounce}
            className="w-[92px] h-[92px] mb-4 object-contain"
            alt="아직 저장한 공고가 없어요"
          />
        );
      case 'bookmark':
        return (
          <div className="relative w-[93px] h-[121px] mb-4 flex items-center justify-center flex-shrink-0">
            <img
              src={emptyBookmarkedListFlag}
              className="w-full h-full object-contain"
              alt="책갈피 리본"
            />
            <img
              src={emptyBookmarkedListDot}
              className="absolute top-[32.5px] left-[35.5px] w-[22px] h-[22px] object-contain"
              alt="책갈피 도트"
            />
          </div>
        );
      case 'none':
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 w-full select-none">
      {/* 일러스트 출력 */}
      {renderIllustration()}

      {/* 메인 메시지 */}
      <h3 className="font-['Pretendard'] font-semibold text-slate-700 text-[14px] leading-snug">
        {message}
      </h3>

      {/* 서브 설명글 */}
      {subMessage && (
        <p className="font-['Pretendard'] text-slate-400 text-[12px] leading-normal mt-1 max-w-[260px]">
          {subMessage}
        </p>
      )}

      {/* 버튼 들어갈 자리 */}
    </div>
  );
}
