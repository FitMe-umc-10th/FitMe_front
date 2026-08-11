import emptyBookmarkedListDot from '@/assets/illustrations/empty-bookmarked-list-dot.svg';
import emptyBookmarkedListFlag from '@/assets/illustrations/empty-bookmarked-list-flag.svg';
import emptyMatchedList from '@/assets/illustrations/empty-matched-list.svg';
import emptySavedAnnounce from '@/assets/illustrations/empty-saved-announce.svg';
import emptyRecentViewed from '@/assets/illustrations/empty-recent-viewed.svg';
import emptyNotification from '@/assets/illustrations/empty-notification.svg';
import emptyWaitingList from '@/assets/empty_waiting_list.svg';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  illustration?: 'heart-plus' | 'heart-wave' | 'recent-viewed' | 'bookmark' | 'clock' | 'bell' | 'none';
  messageClassName?: string;
  subMessageClassName?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  message,
  subMessage,
  illustration = 'none',
  messageClassName = '',
  subMessageClassName = '',
  cta,
}: EmptyStateProps) {
  const renderIllustration = () => {
    switch (illustration) {
      case 'bell':
        return (
          <img
            src={emptyNotification}
            className="w-[92px] h-[92px] mb-4 object-contain"
            alt="알림 없음"
          />
        );
      case 'heart-plus':
        return (
          <img
            src={emptySavedAnnounce}
            className="w-[92px] h-[92px] mb-4 object-contain"
            alt="저장된 공고 없음"
          />
        );
      case 'heart-wave':
        return (
          <img
            src={emptyMatchedList}
            className="w-[92px] h-[92px] mb-4 object-contain"
            alt="매칭된 공고 없음"
          />
        );
      case 'recent-viewed':
        return (
          <img
            src={emptyRecentViewed}
            className="mb-[6px] h-[84px] w-[104px] object-contain"
            alt="최근 조회한 공고 없음"
          />
        );
      case 'bookmark':
        return (
          <div className="relative w-[92px] h-[92px] mb-4">
            <img
              src={emptyBookmarkedListFlag}
              className="absolute inset-0 w-full h-full object-contain"
              alt="북마크 배경"
            />
            <img
              src={emptyBookmarkedListDot}
              className="absolute inset-0 w-full h-full object-contain animate-bounce"
              style={{ animationDuration: '2s' }}
              alt="북마크 느낌표"
            />
          </div>
        );
      case 'clock':
        return (
          <img
            src={emptyWaitingList}
            className="w-[92px] h-[92px] mb-4 object-contain"
            alt="결과 대기중인 이력"
          />
        );
      case 'none':
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 w-full">
      {renderIllustration()}

      {/* 메인 메시지 */}
      <h3 className={`font-['Pretendard'] font-semibold text-slate-700 text-[14px] leading-snug mt-3 ${messageClassName}`}>
        {message}
      </h3>

      {/* 서브 설명글 */}
      {subMessage && (
        <p
          className={`font-['Pretendard'] text-slate-400 text-[12px] leading-normal mt-1.5 max-w-[260px] whitespace-pre-line ${subMessageClassName}`}
        >
          {subMessage}
        </p>
      )}

      {/* CTA 버튼 */}
      {cta && (
        <button
          onClick={cta.onClick}
          className="mt-6 w-[290px] h-[48px] bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-[14px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
