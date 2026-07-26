import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';
import { getFAQs } from '@/apis/faqs';
import { submitInquiry } from '@/apis/inquiries';

export default function CustomerSupport() {
  const navigate = useNavigate();
  const toast = useToastStore();

  // 1. FAQ 및 유저 프로필 데이터 조회
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: getFAQs,
  });

  // 1:1 문의 모달 상태 및 폼 필드 상태
  const [replyEmail, setReplyEmail] = useState('');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [content, setContent] = useState('');

  // FAQ 아코디언 개별 제어를 위한 로컬 상태
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const handleFaqToggle = (id: number) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  // 2. 1:1 문의 제출 Mutation
  const { mutate: sendInquiry, isPending: isSubmitting } = useMutation({
    mutationFn: submitInquiry,
    onSuccess: () => {
      toast.success('1:1 문의가 성공적으로 접수되었습니다.');
      setReplyEmail('');
      setContent('');
      setIsInquiryOpen(false);
    },
    onError: () => {
      toast.error('문의 제출 중 에러가 발생했습니다.');
    },
  });

  // 제출 실행 핸들러
  const handleInquirySubmit = () => {
    if (!replyEmail.trim()) {
      toast.error('답변 받을 이메일을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      toast.error('상세 문의 내용을 입력해 주세요.');
      return;
    }

    sendInquiry({
      replyEmail,
      content,
    });
  };

  if (isLoading) {
    return (
      <Layout
        header={
          <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
            <div className="w-[41px] h-[41px]" />
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 text-center">
              고객 센터
            </h1>
          </header>
        }
      >
        <div className="animate-pulse space-y-3 p-4">
          <div className="h-14 rounded-xl bg-gray-100" />
          <div className="h-14 rounded-xl bg-gray-100" />
          <div className="h-14 rounded-xl bg-gray-100" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      header={
        <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
              <path
                d="M15 18L9 12L15 6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 select-none text-center">
            고객 센터
          </h1>
          <div className="w-[41px] h-[41px]" />
        </header>
      }
      className="bg-white"
    >
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)] justify-between bg-white">
        {/* 상단 FAQ 영역 */}
        <div className="flex flex-col">
          {/* 자주 묻는 질문 타이틀 레이아웃 (w-402 h-28, px-20, 18px SemiBold) */}
          <div className="w-full max-w-[402px] h-[28px] pl-[20px] pr-[20px] flex items-center mt-[24px] mx-auto text-left">
            <h2 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800 select-none">
              자주 묻는 질문
            </h2>
          </div>

          {/* 질문 리스트 영역 */}
          {faqs && faqs.faqs.length > 0 ? (
            <div className="flex flex-col bg-white mt-[12px]">
              {faqs.faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.faqId;
                return (
                  <div
                    key={faq.faqId}
                    className="w-full max-w-[402px] mx-auto flex flex-col border-b border-gray-100/80"
                  >
                    {/* 질문 버튼 (h-80, pt-28 pb-28, px-20) */}
                    <button
                      type="button"
                      onClick={() => handleFaqToggle(faq.faqId)}
                      className="w-full h-[80px] pt-[28px] pr-[20px] pb-[28px] pl-[20px] flex items-center justify-between text-left focus:outline-none transition-colors hover:bg-gray-50/30"
                    >
                      {/* 질문 텍스트 스택 (w-255 h-22, gap-16) */}
                      <div className="w-[255px] h-[22px] flex items-center gap-[16px] min-w-0">
                        <span className="text-[16px] font-bold text-[#0066ff] shrink-0 select-none">
                          Q.
                        </span>
                        <span className="text-[16px] font-semibold leading-[140%] tracking-normal text-gray-800 truncate select-none">
                          {faq.question}
                        </span>
                      </div>

                      {/* 화살표 아이콘 (w-24 h-24) */}
                      <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0 text-gray-400">
                        <svg
                          className={`size-6 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-blue-500' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* 답변 카드 영역 (w-362, min-h-106, pt-15 pb-15 px-18, rounded-8, bg-#f4f8ff) */}
                    {isExpanded && (
                      <div className="w-[362px] min-h-[106px] pt-[15px] pr-[18px] pb-[15px] pl-[18px] rounded-[8px] bg-[#f4f8ff] text-gray-700 text-[12px] font-medium leading-[160%] tracking-normal text-left whitespace-pre-wrap mt-[4px] mb-[20px] mx-auto animate-fade-in-up flex flex-col justify-center">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 mt-4 mx-4">
              <p className="text-sm text-gray-400">자주 묻는 질문이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 하단 1:1 문의 남기기 버튼 (w-361 h-56, 18px SemiBold) */}
        <div className="mt-12 pb-6 w-full max-w-[361px] mx-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsInquiryOpen(true)}
            className="w-full h-[56px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-[18px] leading-[140%] tracking-normal text-center shadow-md active:scale-[0.98] transition-all flex items-center justify-center"
          >
            1:1 문의 남기기
          </button>
        </div>
      </div>

      {/* 1:1 문의 로컬 커스텀 모달 (Layout 1: w-323 h-67, Layout 2: w-323 h-305) */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 animate-fade-in">
          {/* 뒷배경 클릭 시 닫기 */}
          <div
            className="absolute inset-0"
            onClick={() => !isSubmitting && setIsInquiryOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            className="relative w-[323px] h-[372px] rounded-[16px] bg-white flex flex-col items-center shadow-2xl animate-fade-in-up select-none overflow-hidden"
          >
            {/* Layout 1: Header (w-323 h-67, pt-32 pb-10 px-20, rounded-t-16) */}
            <div className="w-[323px] h-[67px] pt-[32px] pr-[20px] pb-[10px] pl-[20px] rounded-t-[16px] flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-900 text-left">
                1:1 문의 남기기
              </h3>
              {/* x 버튼 (w-24 h-24) */}
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                disabled={isSubmitting}
                className="w-[24px] h-[24px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none active:scale-90"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Layout 2: Form + Button Container (w-323 h-305, pt-10 pb-16) */}
            <div className="w-[323px] h-[305px] pt-[10px] pb-[16px] flex flex-col items-center shrink-0 bg-white">
              {/* 1. 답변 받을 이메일 라벨 */}
              <div className="w-[283px] text-left">
                <label className="text-[14px] font-semibold leading-[140%] tracking-[-0.24px] text-gray-900 select-none">
                  답변 받을 이메일
                </label>
              </div>

              {/* 2. 이메일 입력 상자 (w-283 h-40, mt-15) */}
              <input
                type="email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                placeholder="contact@fitme.com"
                disabled={isSubmitting}
                className="w-[283px] h-[40px] mt-[15px] pt-[10px] pr-[15px] pb-[10px] pl-[15px] rounded-[8px] border border-gray-200 bg-white text-[14px] font-medium leading-[140%] tracking-normal text-gray-800 focus:border-blue-500 focus:outline-none transition-all placeholder-gray-400"
              />

              {/* 3. 문의 내용 라벨 (mt-15) */}
              <div className="w-[283px] text-left mt-[15px]">
                <label className="text-[14px] font-semibold leading-[140%] tracking-[-0.24px] text-gray-900 select-none">
                  문의 내용
                </label>
              </div>

              {/* 4. 문의 내용 입력 상자 (w-283 h-88, mt-15) */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="서비스 이용 중 불편한 점이나 건의사항을 자세히 적어주세요. (최대 500자)"
                disabled={isSubmitting}
                maxLength={500}
                className="w-[283px] h-[88px] mt-[15px] pt-[10px] pr-[15px] pb-[40px] pl-[15px] rounded-[8px] bg-gray-50 text-[14px] font-medium leading-[140%] tracking-normal text-gray-800 focus:bg-gray-100 focus:outline-none transition-all resize-none placeholder-gray-400"
              />

              {/* 5. 문의 접수하기 버튼 (w-295 h-42, 패딩 상하 10px 좌우 32px, gap 10px, mt-24, mb-0, font-medium 두께 조절) */}
              <button
                type="button"
                onClick={handleInquirySubmit}
                disabled={isSubmitting}
                className="w-[295px] h-[42px] py-[10px] px-[32px] gap-[10px] mt-[24px] flex items-center justify-center rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-[16px] leading-[140%] tracking-normal text-center transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? '접수 중...' : '문의 접수하기'}
              </button>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
