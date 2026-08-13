import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';
import { getFAQs } from '@/apis/faqs';
import { submitInquiry } from '@/apis/inquiries';
import { validateInquiry } from '@/shared/utils/validation';
import chevronLeftIcon from '@/assets/icons/chevron-left.svg';
import chevronDownIcon from '@/assets/icons/chevron-down.svg';
import closeXIcon from '@/assets/icons/close-x.svg';

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
      toast.success('1:1 문의 접수가 완료되었습니다.');
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
    const { emailError, contentError } = validateInquiry(replyEmail, content);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    if (contentError) {
      toast.error(contentError);
      return;
    }

    sendInquiry({
      replyEmail: replyEmail.trim(),
      content: content.trim(),
    });
  };

  if (isLoading) {
    return (
      <Layout
        header={
          <header className="relative flex h-14 items-center bg-white px-5">
            <div className="w-[10.25px]" />
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] tracking-[0px] text-[#000B24] select-none text-center">
              고객센터
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
        <header className="relative flex h-14 items-center bg-white px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-0 text-gray-800 hover:opacity-70 active:scale-95 transition-all shrink-0 focus:outline-none"
            aria-label="뒤로가기"
          >
            <img src={chevronLeftIcon} className="w-[10.25px] h-[18.45px] block" alt="뒤로가기" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] tracking-[0px] text-[#000B24] select-none text-center">
            고객센터
          </h1>
        </header>
      }
      className="bg-white"
    >
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)] justify-between bg-white px-[20px]">
        {/* 상단 FAQ 영역 */}
        <div className="flex flex-col w-full">
          {/* 자주 묻는 질문 타이틀 레이아웃 */}
          <div className="w-full h-[28px] flex items-center mt-[24px] text-left">
            <h2 className="text-[18px] font-semibold leading-[140%] tracking-[0px] text-[#1E1E1E] select-none">
              자주 묻는 질문
            </h2>
          </div>

          {/* 질문 리스트 영역 */}
          {faqs && faqs.faqs.length > 0 ? (
            <div className="flex flex-col bg-white mt-[12px] w-full">
              {faqs.faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.faqId;
                return (
                  <div
                    key={faq.faqId}
                    className="w-full flex flex-col border-b border-gray-100/80"
                  >
                    {/* 질문 버튼 (긴 질문도 다음 줄로 자동 줄바꿈) */}
                    <button
                      type="button"
                      onClick={() => handleFaqToggle(faq.faqId)}
                      className="w-full min-h-[80px] py-[24px] flex items-center justify-between text-left focus:outline-none transition-colors hover:bg-gray-50/30 gap-[12px]"
                    >
                      {/* 질문 텍스트 스택 */}
                      <div className="flex-1 flex items-start gap-[16px] min-w-0">
                        <span className="text-[16px] font-bold text-[#0066ff] leading-[140%] shrink-0 select-none">
                          Q.
                        </span>
                        <span className="text-[16px] font-medium leading-[140%] tracking-[0px] text-[#1E1E1E] select-none break-keep">
                          {faq.question}
                        </span>
                      </div>

                      {/* 화살표 아이콘 */}
                      <div className="flex items-center justify-center shrink-0">
                        <img
                          src={chevronDownIcon}
                          className={`w-[13.86px] h-[7.74px] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          alt=""
                        />
                      </div>
                    </button>

                    {/* 답변 카드 영역 (화면 꽉 차게, 상하좌우 패딩 15px, rounded-8, bg-#f4f8ff, 글자 크기 12px) */}
                    {isExpanded && (
                      <div className="w-full min-h-[106px] p-[15px] rounded-[8px] bg-[#f4f8ff] text-gray-700 text-[12px] font-medium leading-[160%] tracking-normal text-left whitespace-pre-wrap mt-[4px] mb-[20px] animate-fade-in-up flex flex-col justify-center">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 mt-4 w-full">
              <p className="text-[12px] text-gray-400">자주 묻는 질문이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 하단 1:1 문의 남기기 버튼 */}
        <div className="mt-12 pb-6 w-full shrink-0">
          <button
            type="button"
            onClick={() => setIsInquiryOpen(true)}
            className="w-full h-[56px] bg-[#0059FF] hover:bg-blue-700 text-white font-semibold rounded-xl text-[18px] leading-[140%] tracking-[0px] text-center shadow-md active:scale-[0.98] transition-all flex items-center justify-center"
          >
            1:1 문의 남기기
          </button>
        </div>
      </div>

      {/* 1:1 문의 로컬 커스텀 모달 */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 animate-fade-in">
          {/* 뒷배경 클릭 시 닫기 */}
          <div
            className="absolute inset-0"
            onClick={() => !isSubmitting && setIsInquiryOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            className="relative w-[323px] min-h-[385px] rounded-[16px] bg-white flex flex-col items-center shadow-2xl animate-fade-in-up select-none overflow-hidden pb-4"
          >
            {/* Layout 1: Header (w-323 h-67, pt-32 pb-10 px-20, rounded-t-16) */}
            <div className="w-[323px] h-[67px] pt-[32px] pr-[20px] pb-[10px] pl-[20px] rounded-t-[16px] flex items-center justify-between shrink-0 bg-white">
              <h3 className="text-[18px] font-semibold leading-[140%] tracking-[0px] text-[#1E1E1E] text-left">
                1:1 문의 남기기
              </h3>
              {/* x 버튼 (w-24 h-24) */}
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                disabled={isSubmitting}
                className="w-[24px] h-[24px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none active:scale-90"
              >
                <img src={closeXIcon} className="w-[16px] h-[16px]" alt="닫기" />
              </button>
            </div>

            {/* Layout 2: Form + Button Container (w-323, pt-10 pb-16) */}
            <div className="w-[323px] pt-[10px] pb-[16px] flex flex-col items-center shrink-0 bg-white">
              {/* 1. 답변 받을 이메일 라벨 */}
              <div className="w-[283px] text-left">
                <label className="text-[14px] font-semibold leading-[140%] tracking-[-0.24px] text-[#1E1E1E] select-none">
                  답변 받을 이메일
                </label>
              </div>

              {/* 2. 이메일 입력 상자 (w-283, 상하좌우 15px 패딩, 12px 폰트) */}
              <input
                type="email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                placeholder="contact@fitme.com"
                disabled={isSubmitting}
                className="w-[283px] min-h-[46px] mt-[15px] p-[15px] rounded-[8px] border border-gray-200 bg-white text-[12px] font-medium leading-[140%] tracking-normal text-gray-800 focus:border-blue-500 focus:outline-none transition-all placeholder-[#A5A5A5] placeholder:text-[12px] placeholder:font-normal"
              />

              {/* 3. 문의 내용 라벨 & 실시간 글자수 카운터 */}
              <div className="w-[283px] flex items-center justify-between text-left mt-[15px]">
                <label className="text-[14px] font-semibold leading-[140%] tracking-[-0.24px] text-[#1E1E1E] select-none">
                  문의 내용
                </label>
                <span
                  className={`text-[12px] font-medium leading-[140%] tracking-[0px] select-none ${
                    content.length >= 500 ? 'text-red-500 font-semibold' : 'text-[#A5A5A5]'
                  }`}
                >
                  {content.length}/500
                </span>
              </div>

              {/* 4. 문의 내용 입력 상자 (500자 엄격 제한 및 실시간 연동) */}
              <textarea
                value={content}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 500) {
                    setContent(val);
                  } else {
                    setContent(val.slice(0, 500));
                  }
                }}
                placeholder="서비스 이용 중 불편한 점이나 건의사항을 자세히 적어주세요. (최대 500자)"
                disabled={isSubmitting}
                maxLength={500}
                className="w-[283px] h-[98px] mt-[10px] p-[15px] rounded-[8px] bg-gray-100 text-[12px] font-medium leading-[160%] tracking-[0px] text-gray-800 focus:bg-gray-100 focus:outline-none transition-all resize-none placeholder-[#A5A5A5] placeholder:text-[12px] placeholder:font-medium placeholder:leading-[160%] placeholder:tracking-[0px]"
              />

              {/* 5. 문의 접수하기 버튼 (w-295 h-42, 패딩 상하 10px 좌우 32px, gap 10px, mt-24, mb-0, font-semibold 두께 조절) */}
              <button
                type="button"
                onClick={handleInquirySubmit}
                disabled={isSubmitting}
                className="w-[295px] h-[42px] py-[10px] px-[32px] gap-[10px] mt-[24px] flex items-center justify-center rounded-[8px] bg-[#0059FF] hover:bg-blue-700 text-white font-semibold text-[16px] leading-[140%] tracking-[0px] text-center transition-all active:scale-95 disabled:opacity-50"
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
