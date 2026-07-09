import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFAQs, submitInquiry } from '@/apis/mypage';
import { Header, Layout, Accordion, Modal } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';

export default function CustomerSupport() {
  const toast = useToastStore();

  // 1. FAQ 데이터 조회
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: getFAQs,
  });

  // 1:1 문의 모달 상태 및 폼 필드 상태
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');

  // 2. 1:1 문의 제출 Mutation
  const { mutate: sendInquiry, isPending: isSubmitting } = useMutation({
    mutationFn: submitInquiry,
    onSuccess: () => {
      toast.success('1:1 문의가 성공적으로 접수되었습니다.');
      // 상태 초기화 및 모달 닫기
      setInquiryTitle('');
      setInquiryContent('');
      setIsInquiryOpen(false);
    },
    onError: () => {
      toast.error('문의 제출 중 에러가 발생했습니다.');
    },
  });

  // 제출 실행 핸들러
  const handleInquirySubmit = () => {
    if (!inquiryTitle.trim()) {
      toast.error('문의 제목을 입력해 주세요.');
      return;
    }
    if (!inquiryContent.trim()) {
      toast.error('상세 문의 내용을 입력해 주세요.');
      return;
    }

    sendInquiry({
      title: inquiryTitle,
      content: inquiryContent,
    });
  };

  if (isLoading) {
    return (
      <Layout header={<Header title="고객센터 및 문의" showBack />}>
        <div className="animate-pulse space-y-3 p-4">
          <div className="h-14 rounded-xl bg-gray-100" />
          <div className="h-14 rounded-xl bg-gray-100" />
          <div className="h-14 rounded-xl bg-gray-100" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout header={<Header title="고객센터 및 문의" showBack />} className="bg-slate-50/50">
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)] justify-between p-4">
        {/* 상단 FAQ 섹션 */}
        <div className="space-y-4">
          <div className="px-1">
            <h3 className="text-sm font-bold text-gray-800">자주 묻는 질문 (FAQ)</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              서비스 이용 관련하여 자주 묻는 질문 모음입니다.
            </p>
          </div>

          {faqs && faqs.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm divide-y divide-gray-50">
              {faqs.map((faq) => (
                <Accordion key={faq.id} title={`Q. ${faq.question}`}>
                  <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                </Accordion>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-400">자주 묻는 질문이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 하단 1:1 문의하기 버튼 */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setIsInquiryOpen(true)}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-md text-sm"
          >
            1:1 문의하기
          </button>
        </div>
      </div>

      {/* 1:1 문의 로컬 모달 */}
      <Modal
        isOpen={isInquiryOpen}
        onClose={() => {
          if (!isSubmitting) setIsInquiryOpen(false);
        }}
        title="1:1 문의 접수"
        description="서비스 이용 중 겪으신 불편이나 제안 사항을 접수해주시면 담당자가 신속히 이메일로 답변해 드리겠습니다."
        buttons={[
          {
            label: '취소',
            variant: 'secondary',
            onClick: () => setIsInquiryOpen(false),
          },
          {
            label: isSubmitting ? '제출 중...' : '제출하기',
            variant: 'primary',
            onClick: handleInquirySubmit,
          },
        ]}
      >
        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">문의 제목</label>
            <input
              type="text"
              value={inquiryTitle}
              onChange={(e) => setInquiryTitle(e.target.value)}
              placeholder="문의 제목을 입력해 주세요."
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-bold text-gray-800 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">상세 내용</label>
            <textarea
              value={inquiryContent}
              onChange={(e) => setInquiryContent(e.target.value)}
              placeholder="상세 문의 내용을 작성해 주세요. (글자 수 제한 없음)"
              disabled={isSubmitting}
              rows={4}
              className="w-full h-32 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-bold text-gray-800 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
