import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '@/apis/mypage';
import { Header, Layout } from '@/shared/components';
import Chip from '@/shared/components/Chip';
import { useToastStore } from '@/store/toastStore';

const AVAILABLE_FIELDS = [
  '마케팅',
  '기획/아이디어',
  '디자인',
  'IT/개발',
  '어학',
  '이학',
  '공학',
  '예체능',
];
const AVAILABLE_REGIONS = [
  '서울특별시 전체',
  '경기도 전체',
  '인천광역시 전체',
  '부산광역시 전체',
  '대구광역시 전체',
];
const INCOME_BRACKETS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function ProfileEdit() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  // 갤러리 파일 선택기 & 직접 촬영 카메라 선택기 ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 1. 기존 유저 정보 패치
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // 2. 로컬 폼 상태 관리
  const [name, setName] = useState('');
  const [gpa, setGpa] = useState<number | string>('');
  const [incomeBracket, setIncomeBracket] = useState<number>(8);
  const [fields, setFields] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [profileImg, setProfileImg] = useState('');

  // 바텀시트 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUploadOption, setSelectedUploadOption] = useState<'camera' | 'gallery' | null>(
    null,
  );

  // 데이터 로드 완료 시 로컬 상태 초기화
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGpa(profile.gpa);
      setIncomeBracket(profile.incomeBracket);
      setFields(profile.fieldsOfInterest);
      setRegion(profile.activityRegion);
      setProfileImg(profile.profileImageUrl);
    }
  }, [profile]);

  // 3. 프로필 저장 Mutation
  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('프로필이 성공적으로 저장되었습니다.');
      navigate('/my');
    },
    onError: () => {
      toast.error('프로필 저장에 실패했습니다.');
    },
  });

  // 관심 직무 토글 핸들러
  const handleToggleField = (field: string) => {
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  // 이미지 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result as string);
        toast.success('프로필 이미지가 선택되었습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  // 바텀시트 확인 버튼 핸들러 (실제 기기 카메라/갤러리 연동)
  const handleConfirmUpload = () => {
    if (selectedUploadOption === 'gallery') {
      fileInputRef.current?.click();
    } else if (selectedUploadOption === 'camera') {
      // 카메라 직접 촬영을 트리거 (capture="environment")
      cameraInputRef.current?.click();
    }
    setIsSheetOpen(false);
  };

  // 프로필 정보 폼 서브밋 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gpaNum = typeof gpa === 'string' ? parseFloat(gpa) || 0 : gpa;

    if (gpaNum < 0 || gpaNum > 4.5) {
      toast.error('학점은 0 ~ 4.5 사이로 입력해 주세요.');
      return;
    }

    saveProfile({
      name,
      gpa: gpaNum,
      incomeBracket,
      fieldsOfInterest: fields,
      activityRegion: region,
      profileImageUrl: profileImg,
    });
  };

  if (isLoading) {
    return (
      <Layout header={<Header title="내 프로필" showBack />}>
        <div className="animate-pulse space-y-6 p-4">
          <div className="mx-auto size-24 rounded-full bg-gray-100" />
          <div className="space-y-4">
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="h-28 rounded-xl bg-gray-100" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout header={<Header title="내 프로필" showBack />} className="bg-slate-50/50">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col min-h-[calc(100vh-3.5rem)] p-4 justify-between"
      >
        {/* 상단 폼 입력부 */}
        <div className="space-y-6">
          {/* 1. 프로필 이미지 편집 영역 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative">
              <div className="size-24 overflow-hidden rounded-full border border-gray-200/80 shadow-md">
                <img src={profileImg} alt="프로필 미리보기" className="size-full object-cover" />
              </div>
              {/* 카메라 토글 버튼 */}
              <button
                type="button"
                onClick={() => {
                  setSelectedUploadOption(null); // 초기화
                  setIsSheetOpen(true);
                }}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 active:scale-95 transition-all text-gray-500"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5">
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M3 9C3 7.89543 3.89543 7 5 7H7.5L9.3 4.6C9.6 4.2 10.1 4 10.6 4H13.4C13.9 4 14.4 4.2 14.7 4.6L16.5 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
            </div>
            <h2 className="mt-3 text-base font-bold text-gray-800">{profile?.name}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">
              {profile?.university} | {profile?.grade}
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* 2. 학업 정보 설정 */}
          <section className="space-y-3.5">
            <h3 className="text-sm font-bold text-gray-800">학업 정보</h3>
            <div className="flex gap-3">
              {/* GPA 입력 */}
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">현재 학점 (GPA)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3.5 pr-12 text-sm font-bold text-gray-800 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 select-none">
                    / 4.5
                  </span>
                </div>
              </div>
              {/* 소득구간 선택 */}
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">소득구간</label>
                <div className="relative">
                  <select
                    value={incomeBracket}
                    onChange={(e) => setIncomeBracket(Number(e.target.value))}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-10 text-sm font-bold text-gray-800 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                  >
                    {INCOME_BRACKETS.map((num) => (
                      <option key={num} value={num}>
                        {num}구간
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 맞춤 핏 조건 설정 */}
          <section className="space-y-3.5">
            <h3 className="text-sm font-bold text-gray-800">맞춤 핏 조건 설정</h3>

            {/* 관심 직무 및 분야 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">관심 직무 및 분야</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FIELDS.map((field) => (
                  <Chip
                    key={field}
                    label={field}
                    selected={fields.includes(field)}
                    onToggle={() => handleToggleField(field)}
                  />
                ))}
              </div>
            </div>

            {/* 희망 활동 지역 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">희망 활동 지역</label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-10 text-sm font-bold text-gray-800 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                >
                  {AVAILABLE_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 하단 저장하기 버튼 */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed text-sm shadow-md"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

      {/* 숨겨진 갤러리 파일 선택기 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 숨겨진 카메라 파일 선택기 (모바일 기기 카메라 다이얼로그 호출) */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* 이미지 업로드 방식 바텀시트 모달 */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0">
          <div className="absolute inset-0" onClick={() => setIsSheetOpen(false)} />
          <div className="relative w-full max-w-[390px] rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in-up pb-[env(safe-area-inset-bottom,20px)]">
            <div className="mx-auto mb-4 h-1.2 w-11 rounded-full bg-gray-200" />
            <h3 className="mb-5 text-center text-sm font-bold text-gray-700">
              이미지 업로드 방식을 선택해주세요.
            </h3>

            <div className="space-y-2 mb-5">
              <button
                type="button"
                onClick={() => setSelectedUploadOption('camera')}
                className={`w-full py-4 text-center text-sm font-bold rounded-xl transition-all ${
                  selectedUploadOption === 'camera'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100/50'
                }`}
              >
                직접 촬영
              </button>
              <button
                type="button"
                onClick={() => setSelectedUploadOption('gallery')}
                className={`w-full py-4 text-center text-sm font-bold rounded-xl transition-all ${
                  selectedUploadOption === 'gallery'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100/50'
                }`}
              >
                갤러리에서 선택
              </button>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="w-full py-4 text-center text-sm font-bold rounded-xl bg-red-50/70 text-red-500 hover:bg-red-50/90 active:scale-[0.99] transition-all"
              >
                돌아가기
              </button>
            </div>

            <button
              type="button"
              disabled={!selectedUploadOption}
              onClick={handleConfirmUpload}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
