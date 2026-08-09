import { useState } from 'react';
import { TERMS } from '@/constants/termsContent';

interface TermsAgreementProps {
  // 필수 약관(이용약관 + 개인정보) 모두 동의됐는지 상위 폼에 전달
  onRequiredChange: (agreed: boolean) => void;
  // 마케팅(선택) 동의 여부 전달 (선택 사용)
  onMarketingChange?: (agreed: boolean) => void;
}

type TermKey = 'service' | 'privacy' | 'marketing';

const ITEMS: { key: TermKey; label: string; required: boolean; text: string }[] = [
  { key: 'service', label: '이용약관 동의', required: true, text: TERMS.service },
  { key: 'privacy', label: '개인정보 처리방침 동의', required: true, text: TERMS.privacy },
  { key: 'marketing', label: '마케팅 정보 수신 동의', required: false, text: TERMS.marketing },
];

export default function TermsAgreement({ onRequiredChange, onMarketingChange }: TermsAgreementProps) {
  const [checks, setChecks] = useState<Record<TermKey, boolean>>({
    service: false,
    privacy: false,
    marketing: false,
  });
  const [openKey, setOpenKey] = useState<TermKey | null>(null);

  const applyChecks = (next: Record<TermKey, boolean>) => {
    setChecks(next);
    onRequiredChange(next.service && next.privacy); // 필수 2개 다 체크돼야 동의
    onMarketingChange?.(next.marketing);
  };

  const toggleCheck = (key: TermKey, value: boolean) => {
    applyChecks({ ...checks, [key]: value });
  };

  const allChecked = checks.service && checks.privacy && checks.marketing;
  const toggleAll = () => {
    const v = !allChecked;
    applyChecks({ service: v, privacy: v, marketing: v });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 전체 동의 */}
      <label className="flex items-center gap-3 rounded-lg bg-[#F5F7FA] px-4 py-3 text-[15px] font-semibold text-[#262626]">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={toggleAll}
          className="size-5 rounded accent-[#0059FF]"
        />
        전체 동의하기
      </label>

      {ITEMS.map((item) => (
        <div key={item.key} className="border-b border-[#F0F0F0] pb-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-[15px] text-[#4B5563]">
              <input
                type="checkbox"
                checked={checks[item.key]}
                onChange={(e) => toggleCheck(item.key, e.target.checked)}
                className="size-5 rounded accent-[#0059FF]"
              />
              <span>
                <span className={item.required ? 'text-[#0059FF]' : 'text-[#9CA3AF]'}>
                  ({item.required ? '필수' : '선택'})
                </span>{' '}
                {item.label}
              </span>
            </label>
            <button
              type="button"
              onClick={() => setOpenKey(openKey === item.key ? null : item.key)}
              className="p-2 text-[12px] text-[#9CA3AF]"
              aria-label="약관 보기"
            >
              {openKey === item.key ? '▲' : '▼'}
            </button>
          </div>

          {openKey === item.key && (
            <div className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-white p-3 text-[13px] leading-relaxed text-[#6B7280]">
              {item.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
