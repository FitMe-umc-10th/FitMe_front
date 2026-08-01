import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUserProfileDetail, updateUserProfile } from '@/apis/mypage';
import { Layout, WebCameraModal } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';
import { validateGpa } from '@/shared/utils/validation';
import defaultPersonImg from '@/assets/illustrations/default_person.svg';
import chevronLeftIcon from '@/assets/icons/chevron-left.svg';
import chevronRightIcon from '@/assets/icons/chevron-right.svg';
import cameraIcon from '@/assets/icons/camera-icon.svg';

const AVAILABLE_FIELDS = [
  { id: 1, name: '마케팅' },
  { id: 2, name: '기획/아이디어' },
  { id: 3, name: '디자인' },
  { id: 4, name: 'IT/개발' },
  { id: 5, name: '어학' },
  { id: 6, name: '이학' },
  { id: 7, name: '공학' },
  { id: 8, name: '예체능' },
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

  // 파일 선택기 ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 실시간 웹 카메라 모달 제어 상태
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // 1. 기존 유저 정보 패치
  const { data: profileDetail, isLoading } = useQuery({
    queryKey: ['profileDetail'],
    queryFn: getUserProfileDetail,
  });

  // 2. 로컬 폼 상태 관리
  const [gpa, setGpa] = useState<number | string>('');
  const [incomeBracket, setIncomeBracket] = useState<number>(8);
  const [interests, setInterests] = useState<number[]>([]);
  const [region, setRegion] = useState('');
  const [profileImg, setProfileImg] = useState('');

  // 통합 바텀시트 제어 상태 ('photo' | 'income' | 'region' | null)
  const [activeBottomSheet, setActiveBottomSheet] = useState<'photo' | 'income' | 'region' | null>(
    null,
  );
  const [selectedUploadOption, setSelectedUploadOption] = useState<'camera' | 'gallery' | null>(
    null,
  );

  useEffect(() => {
    if (profileDetail) {
      setGpa(profileDetail.gpa);
      setIncomeBracket(profileDetail.incomeBracket);
      setInterests(profileDetail.interests.map((interest) => interest.interestId));
      setRegion(profileDetail.region);
      setProfileImg(profileDetail.profileImageUrl);
    }
  }, [profileDetail]);

  // 3. 프로필 저장 Mutation
  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileDetail'] });
      queryClient.invalidateQueries({ queryKey: ['profileSetting'] });
      toast.success('프로필이 성공적으로 저장되었습니다.');
      navigate('/my');
    },
    onError: () => {
      toast.error('프로필 저장에 실패했습니다.');
    },
  });

  // 관심 직무 토글 핸들러
  const handleToggleField = (field: { id: number; name: string }) => {
    setInterests((prev) =>
      prev.includes(field.id) ? prev.filter((f) => f !== field.id) : [...prev, field.id],
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

  // 바텀시트 확인 버튼 핸들러 (사진 업로드 전용)
  const handleConfirmUpload = () => {
    if (selectedUploadOption === 'gallery') {
      fileInputRef.current?.click();
      setActiveBottomSheet(null);
    } else if (selectedUploadOption === 'camera') {
      setIsCameraModalOpen(true);
      setActiveBottomSheet(null);
    }
  };

  // 프로필 정보 폼 서브밋 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gpaNum = typeof gpa === 'string' ? parseFloat(gpa) || 0 : gpa;

    const gpaErrorMsg = validateGpa(gpaNum);
    if (gpaErrorMsg) {
      toast.error(gpaErrorMsg);
      return;
    }

    saveProfile({
      gpa: gpaNum,
      incomeBracket,
      interests: interests,
      region: region,
      profileImageUrl: profileImg,
    });
  };

  if (isLoading) {
    return (
      <Layout
        header={
          <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
            <div className="w-[41px] h-[41px]" />
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 text-center">
              내 프로필
            </h1>
          </header>
        }
      >
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
    <Layout
      header={
        <header className="relative flex h-14 items-center bg-white px-4 border-b border-gray-100/50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[41px] h-[41px] flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
          >
            <img src={chevronLeftIcon} className="size-6" alt="뒤로가기" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold leading-[140%] text-gray-950 select-none text-center">
            내 프로필
          </h1>
          <div className="w-[41px] h-[41px]" />
        </header>
      }
      className="bg-white"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col min-h-[calc(100vh-3.5rem)] px-[20px] pb-6 justify-between"
      >
        {/* 상단 폼 입력부 */}
        <div className="space-y-0">
          {/* 1. 프로필 이미지 편집 영역 */}
          <div className="flex flex-col items-center justify-center mt-[20px]">
            <div className="relative w-[101px] h-[101px]">
              <div className="w-[101px] h-[101px] overflow-hidden rounded-[50.5px] border border-gray-200/80 shadow-md">
                <img
                  src={profileImg || defaultPersonImg}
                  onError={(e) => {
                    e.currentTarget.src = defaultPersonImg;
                  }}
                  alt="프로필 미리보기"
                  className="size-full object-cover ince"
                />
              </div>
              {/* 카메라 토글 버튼 */}
              <button
                type="button"
                onClick={() => {
                  setSelectedUploadOption(null);
                  setActiveBottomSheet('photo');
                }}
                className="absolute bottom-0 right-0 w-[26px] h-[26px] flex items-center justify-center rounded-full bg-white border-[2px] border-gray-200 p-[1px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-500 z-10"
              >
                <img src={cameraIcon} className="size-3" alt="카메라" />
              </button>
            </div>
            <h2 className="mt-[12px] text-lg font-semibold text-gray-800 leading-tight">
              {profileDetail?.name}
            </h2>
            <p className="mt-[10px] text-xs font-medium text-gray-400 leading-none">
              {profileDetail?.universityName}
            </p>
          </div>

          {/* 2. 학업 정보 설정 (16px 마진 탑) */}
          <section className="mt-[16px]">
            <h3 className="w-full max-w-[402px] h-[45px] pt-[10px] pb-[10px] flex items-center text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800">
              학업 정보
            </h3>

            {/* GPA & 소득구간 입력부 (8px 마진 탑) */}
            <div className="flex justify-between gap-[12px] mt-[8px] w-full max-w-[362px] mx-auto">
              {/* GPA 입력 (w-175 h-76) */}
              <div className="w-[175px] h-[76px] flex flex-col gap-[8px]">
                <label className="w-[93px] h-[20px] text-xs font-medium text-gray-400 flex items-center">
                  현재 학점 (GPA)
                </label>
                <div className="relative w-[175px] h-[48px] rounded-[12px] border border-gray-200 bg-white py-[12px] px-[15px] flex items-center justify-between transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="w-full h-full bg-transparent text-sm font-bold text-gray-800 focus:outline-none pr-8"
                  />
                  <span className="absolute right-[15px] text-xs font-semibold text-gray-400 select-none">
                    / 4.5
                  </span>
                </div>
              </div>

              {/* 소득구간 선택 - 프리미엄 바텀시트 연동 (w-175 h-76) */}
              <div className="w-[175px] h-[76px] flex flex-col gap-[8px]">
                <label className="w-[49px] h-[20px] text-xs font-medium text-gray-400 flex items-center">
                  소득구간
                </label>
                <button
                  type="button"
                  onClick={() => setActiveBottomSheet('income')}
                  className="w-[175px] h-[48px] rounded-[12px] border border-gray-200 bg-white py-[12px] px-[15px] flex items-center justify-between hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 active:scale-[0.98] transition-all text-left focus:outline-none"
                >
                  <span className="text-sm font-bold text-gray-800">{incomeBracket}구간</span>
                  <div className="text-gray-400">
                    <img src={chevronRightIcon} className="size-4" alt="" />
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* 3. 맞춤 핏 조건 설정 (20px 마진 탑) */}
          <section className="mt-[28px]">
            <h3 className="text-[18px] font-semibold leading-[140%] tracking-normal text-gray-800">
              맞춤 핏 조건 설정
            </h3>

            {/* 관심 직무 및 분야 (8px 마진 탑) */}
            <div className="mt-[18px]">
              <label className="text-[14px] font-medium leading-[140%] tracking-normal text-gray-400 select-none block">
                관심 직무 및 분야
              </label>

              {/* 선택 칩 세트 (12px 마진 탑 - 가로 스와이프 스크롤 연동) */}
              <div className="flex flex-row gap-2 mt-[6px] w-full max-w-[362px] mx-auto overflow-x-auto whitespace-nowrap scrollbar-none py-1">
                {AVAILABLE_FIELDS.map((field) => {
                  const selected = interests.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => handleToggleField(field)}
                      className={`h-[36px] px-[12px] py-[8px] rounded-full text-xs font-medium flex items-center justify-center shrink-0 transition-all ${
                        selected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {field.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 희망 활동 지역 (선택지 칩 세트와 12px 마진 탑 - 프리미엄 바텀시트 연동) */}
            <div className="mt-[12px] w-full max-w-[362px] mx-auto">
              <label className="text-[14px] font-medium leading-[140%] tracking-normal text-gray-400 select-none block mb-[12px]">
                희망 활동 지역
              </label>
              <button
                type="button"
                onClick={() => setActiveBottomSheet('region')}
                className="w-full h-[48px] rounded-[12px] border border-gray-200 bg-white py-[12px] px-[15px] flex items-center justify-between shadow-sm hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 active:scale-[0.98] transition-all text-left focus:outline-none"
              >
                <span className="text-sm font-medium text-gray-800">{region}</span>
                <div className="text-gray-400">
                  <img src={chevronRightIcon} className="size-4" alt="" />
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* 하단 저장하기 버튼 (희망 지역 셀렉트 박스에서 96px 마진 탑, 크기 w-361 h-56) */}
        <div className="mt-[96px] w-full max-w-[361px] mx-auto">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-[56px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-[18px] leading-[140%] tracking-normal text-center transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
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

      {/* 숨겨진 카메라 파일 선택기 */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* 이미지 업로드 방식 바텀시트 모달 */}
      {activeBottomSheet === 'photo' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0">
          <div className="absolute inset-0" onClick={() => setActiveBottomSheet(null)} />
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

      {/* 소득구간 선택 바텀시트 모달 */}
      {activeBottomSheet === 'income' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0">
          <div className="absolute inset-0" onClick={() => setActiveBottomSheet(null)} />
          <div className="relative w-full max-w-[390px] rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in-up pb-[env(safe-area-inset-bottom,20px)]">
            <div className="mx-auto mb-4 h-1.2 w-11 rounded-full bg-gray-200" />
            <h3 className="mb-5 text-center text-sm font-bold text-gray-700">
              소득구간을 선택해주세요.
            </h3>

            <div className="space-y-2 mb-5 max-h-[260px] overflow-y-auto scrollbar-none px-1">
              {INCOME_BRACKETS.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setIncomeBracket(num);
                    setActiveBottomSheet(null);
                    toast.success(`${num}구간이 선택되었습니다.`);
                  }}
                  className={`w-full py-3.5 text-center text-sm font-semibold rounded-xl transition-all ${
                    incomeBracket === num
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100/50'
                  }`}
                >
                  {num}구간
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveBottomSheet(null)}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 희망 활동 지역 선택 바텀시트 모달 */}
      {activeBottomSheet === 'region' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0">
          <div className="absolute inset-0" onClick={() => setActiveBottomSheet(null)} />
          <div className="relative w-full max-w-[390px] rounded-t-3xl bg-white p-5 shadow-2xl animate-fade-in-up pb-[env(safe-area-inset-bottom,20px)]">
            <div className="mx-auto mb-4 h-1.2 w-11 rounded-full bg-gray-200" />
            <h3 className="mb-5 text-center text-sm font-bold text-gray-700">
              희망 활동 지역을 선택해주세요.
            </h3>

            <div className="space-y-2 mb-5">
              {AVAILABLE_REGIONS.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    setRegion(reg);
                    setActiveBottomSheet(null);
                    toast.success(`${reg} 지역이 선택되었습니다.`);
                  }}
                  className={`w-full py-3.5 text-center text-sm font-semibold rounded-xl transition-all ${
                    region === reg
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100/50'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveBottomSheet(null)}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 웹 카메라 직접 촬영 팝업 모달 (모듈화) */}
      <WebCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => {
          setProfileImg(dataUrl);
          toast.success('사진 촬영이 완료되었습니다.');
        }}
      />
    </Layout>
  );
}
