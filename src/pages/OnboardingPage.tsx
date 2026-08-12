import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/shared/components';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import Chip from '@/shared/components/Chip';
import BottomSheet from '@/shared/components/BottomSheet';
import { useAuthStore } from '@/store/authStore';
import { saveOnboarding } from '@/apis/auth';
import { validateGpa } from '@/shared/utils/validation';
import SearchableSelect from '@/shared/components/SearchableSelect';
import { REGION_OPTIONS } from '@/constants/regions';
import { UNIVERSITY_OPTIONS } from '@/constants/universities';
import { useToastStore } from '@/store/toastStore';

const INTERESTS = ['마케팅', '기획/아이디어', '디자인', 'IT/개발', '어학', '영상편집'];

const INCOME_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}구간`,
  value: String(i + 1),
}));

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
  const labelClass = 'mb-1.5 block font-semibold';

  return (
    <div className="flex min-h-dvh flex-col px-6 py-8">
      {/* 헤더: 뒤로가기 + 진행바 */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
          className="text-2xl text-gray-800"
        >
          ‹
        </button>
        {step >= 1 && (
          <div className="flex-1">
            <ProgressBar current={step} total={4} />
          </div>
        )}
      </div>

      <div className="flex-1">
        {/* 인트로 */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold leading-relaxed">
              안녕하세요!
              <br />
              <span className="text-blue-600">{userName}님의 정보를 알려주세요</span>
            </h1>
            <p className="mt-3 text-sm text-gray-400">맞춤 추천을 위해 필요해요</p>
          </div>
        )}

        {/* 1단계: 거주지·대학 */}
        {step === 1 && (
          <div>
            <h2 className="mb-8 text-xl font-bold leading-relaxed">
              거주지역과 소속대학을
              <br />
              입력해 주세요!
            </h2>
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
            <h2 className="mb-8 text-xl font-bold leading-relaxed">
              학점과 소득구간을
              <br />
              작성해 주세요!
            </h2>
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
                className={`w-full rounded-lg border border-blue-500 px-4 py-3 text-center font-semibold ${
                  income ? 'text-gray-900' : 'text-blue-600'
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
            <h2 className="mb-2 text-xl font-bold leading-relaxed">
              어떤 공모전에
              <br />
              관심이 있나요?
            </h2>
            <p className="mb-6 text-sm text-gray-400">복수 선택이 가능해요</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={interests.includes(item)}
                  onToggle={() => toggleInterest(item)}
                />
              ))}
            </div>
            <div className="mt-4">
              <Input value={customInterest} onChange={setCustomInterest} placeholder="직접 입력" />
            </div>
          </div>
        )}

        {/* 4단계: 완료 */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold leading-relaxed">
              이제 나에게 딱 맞는
              <br />
              <span className="text-blue-600">장학금과 공모전을</span>
              <br />
              확인해볼까요?
            </h1>
          </div>
        )}
      </div>

      {/* 하단 버튼 (크게) */}
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
