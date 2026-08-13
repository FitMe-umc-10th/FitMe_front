import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/shared/components';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import Chip from '@/shared/components/Chip';
import BottomSheet from '@/shared/components/BottomSheet';
import TypingText, { type TypingSegment } from '@/shared/components/TypingText';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { saveOnboarding } from '@/apis/auth';
import { validateGpa } from '@/shared/utils/validation';
import SearchableSelect from '@/shared/components/SearchableSelect';
import { REGION_OPTIONS } from '@/constants/regions';
import { UNIVERSITY_OPTIONS } from '@/constants/universities';

const INTERESTS = ['마케팅', '기획/아이디어', '디자인', 'IT/개발', '어학', '영상편집'];

const INCOME_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}구간`,
  value: String(i + 1),
}));

// 디자인 시안 공통 타이포 (H1 SemiBold 24 / 140%, Body B2 Medium 16 / 140%)
const headingClass = 'block text-[24px] font-semibold leading-[140%] text-[#1E1E1E]';
const subTextClass = 'text-[16px] font-medium leading-[140%] text-[#A5A5A5]';
const labelClass =
  'mb-2 block text-[18px] font-medium leading-[140%] tracking-[-0.244565px] text-[#262626]';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const userName = useAuthStore((s) => s.userName);
  const toastError = useToastStore((s) => s.error);

  const [step, setStep] = useState(0);
  const [residence, setResidence] = useState('');
  const [university, setUniversity] = useState('');
  const [gpa, setGpa] = useState('');
  const [income, setIncome] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [incomeSheetOpen, setIncomeSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [typingDone, setTypingDone] = useState(false); // 제목 타이핑 완료 여부

  // 단계가 바뀌면 타이핑을 처음부터 다시 시작
  useEffect(() => {
    setTypingDone(false);
  }, [step]);

  const gpaError = gpa !== '' ? validateGpa(gpa) || undefined : undefined;

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const canNext =
    step === 1
      ? residence !== '' && university !== ''
      : step === 2
        ? gpa !== '' && !gpaError && income !== ''
        : step === 3
          ? interests.length > 0 || customInterest.trim() !== ''
          : true;

  // 단계별 제목 (색이 다른 부분은 구간을 나눠서 전달)
  const headingSegments: TypingSegment[] = useMemo(() => {
    switch (step) {
      case 0:
        return [
          { text: '안녕하세요!\n' },
          { text: `${userName}님의`, className: 'text-[#0059FF]' },
          { text: ' 정보를 알려주세요' },
        ];
      case 1:
        return [{ text: '거주지역과 소속대학을\n입력해 주세요!' }];
      case 2:
        return [{ text: '학점과 소득구간을\n작성해 주세요!' }];
      case 3:
        return [{ text: '어떤 공모전에\n관심이 있나요?' }];
      default:
        return [
          { text: '이제 나에게 딱 맞는\n' },
          { text: '장학금과 공모전을', className: 'text-[#0059FF]' },
          { text: '\n확인해볼까요?' },
        ];
    }
  }, [step, userName]);

  const handleFinish = async () => {
    if (isSaving) return; // 중복 제출 방지
    setIsSaving(true);
    try {
      await saveOnboarding({
        region: residence,
        university,
        gpa: Number(gpa),
        incomeLevel: income,
        interests,
        customInterests: customInterest.trim() ? [customInterest.trim()] : [],
      });
      // 저장 성공 → 온보딩 완료 처리 후 홈으로
      setOnboarded(true);
      navigate('/');
    } catch {
      // 저장 실패 → 화면 유지 + 사용자에게 안내
      toastError('온보딩 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col px-5 py-8">
      {/* 헤더: 뒤로가기 + 진행바 (0단계부터 표시) */}
      <div className="mb-8 flex h-9 items-center gap-16">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
          aria-label="뒤로가기"
          className="flex h-9 w-[18px] shrink-0 items-center justify-center"
        >
          <svg viewBox="0 0 18 36" aria-hidden="true" className="h-9 w-[18px]">
            <path
              d="M12.5 8 5.5 18l7 10"
              fill="none"
              stroke="#1E1E1E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="w-[201px]">
          <ProgressBar current={step} total={4} />
        </div>
      </div>

      {/* 단계 제목 — 한 글자씩 타이핑 (step을 key로 줘서 단계마다 새로 실행) */}
      <div className="mb-8 flex flex-col gap-3">
        <h1>
          <TypingText
            key={step}
            segments={headingSegments}
            className={headingClass}
            onDone={() => setTypingDone(true)}
          />
        </h1>

        {/* 보조 문구 — 타이핑이 끝난 뒤 부드럽게 등장 (자리는 미리 차지해 레이아웃 흔들림 방지) */}
        {(step === 0 || step === 3) && (
          <p className={`${subTextClass} ${typingDone ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {step === 0 ? '맞춤 추천을 위해 필요해요' : '복수 선택이 가능해요'}
          </p>
        )}
      </div>

      <div className="flex-1">
        {/* 1단계: 거주지·대학 */}
        {step === 1 && (
          <div>
            <label className={labelClass}>거주지역</label>
            <SearchableSelect
              fullWidth
              placeholder="검색하기"
              options={REGION_OPTIONS}
              value={residence}
              onChange={setResidence}
            />
            <div className="mt-5">
              <label className={labelClass}>소속대학</label>
              <SearchableSelect
                fullWidth
                placeholder="검색하기"
                options={UNIVERSITY_OPTIONS}
                value={university}
                onChange={setUniversity}
              />
            </div>
          </div>
        )}

        {/* 2단계: 학점·소득 */}
        {step === 2 && (
          <div>
            <label className={labelClass}>학점 (GPA)</label>
            <Input
              value={gpa}
              onChange={setGpa}
              placeholder="직접 입력"
              type="number"
              error={gpaError}
            />
            <div className="mt-5">
              <label className={labelClass}>한국장학재단 소득구간</label>
              <button
                type="button"
                onClick={() => setIncomeSheetOpen(true)}
                className={`h-12 w-full rounded-xl border px-[15px] text-center text-[16px] font-medium leading-[140%] tracking-[-0.244565px] transition-colors ${
                  income
                    ? 'border-[#0059FF] text-left text-[#262626]'
                    : 'border-[#0059FF] text-[#0059FF]'
                }`}
              >
                {income ? `${income}구간` : '선택하기'}
              </button>
            </div>
          </div>
        )}

        {/* 3단계: 관심분야 + 직접입력 */}
        {step === 3 && (
          <div>
            {/* 칩 사이 8px, 줄 사이 12px (시안 기준) */}
            <div className="flex flex-wrap gap-x-2 gap-y-3">
              {INTERESTS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={interests.includes(item)}
                  onToggle={() => toggleInterest(item)}
                />
              ))}
            </div>
            <div className="mt-5">
              <Input value={customInterest} onChange={setCustomInterest} placeholder="직접 입력" />
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-8">
        {step === 0 && (
          <Button variant="primary" size="lg" fullWidth onClick={() => setStep(1)}>
            시작하기
          </Button>
        )}
        {step >= 1 && step <= 3 && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
          >
            다음
          </Button>
        )}
        {step === 4 && (
          <Button variant="primary" size="lg" fullWidth onClick={handleFinish} disabled={isSaving}>
            {isSaving ? '저장 중...' : '확인하러 가기'}
          </Button>
        )}
      </div>

      <BottomSheet
        isOpen={incomeSheetOpen}
        title="소득구간을 선택하세요"
        options={INCOME_OPTIONS}
        onSelect={setIncome}
        onClose={() => setIncomeSheetOpen(false)}
      />
    </div>
  );
}
