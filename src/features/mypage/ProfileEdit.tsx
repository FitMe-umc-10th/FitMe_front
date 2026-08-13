import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  getPresignedUrl,
  uploadImageToS3,
  getUserProfileDetail,
  updateUserProfile,
} from '@/apis/mypage';
import { Layout, WebCameraModal } from '@/shared/components';
import { useToastStore } from '@/store/toastStore';
import { validateGpa } from '@/shared/utils/validation';
import { dataURLtoFile } from '@/shared/utils/file';
import defaultPersonImg from '@/assets/illustrations/default_person.svg';
import chevronLeftIcon from '@/assets/icons/chevron-left.svg';
import cameraIcon from '@/assets/icons/camera_img.svg';

const AVAILABLE_FIELDS = [
  { id: 1, name: '마케팅' },
  { id: 2, name: '기획/ 아이디어' },
  { id: 3, name: '디자인' },
  { id: 4, name: 'IT/개발' },
  { id: 5, name: '어학' },
  { id: 6, name: '영상편집' },
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
  const gpaInputRef = useRef<HTMLInputElement>(null);
  const measureGpaRef = useRef<HTMLSpanElement>(null);
  const [gpaTextWidth, setGpaTextWidth] = useState(33);

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

  useEffect(() => {
    if (profileDetail) {
      setGpa(profileDetail.gpa);
      setIncomeBracket(profileDetail.incomeBracket);
      if (Array.isArray(profileDetail.interests)) {
        const selectedIds = profileDetail.interests
          .filter((interest: any) =>
            typeof interest === 'number'
              ? true
              : interest.selected === true || interest.selected === undefined,
          )
          .map((interest: any) => (typeof interest === 'number' ? interest : interest.interestId));
        setInterests(selectedIds);
      }
      setRegion(profileDetail.region);
      setProfileImg(profileDetail.profileImageUrl);
    }
  }, [profileDetail]);

  // 학점 텍스트 실제 픽셀 너비 동적 측정 (/4.5 완전 밀착용)
  useEffect(() => {
    if (measureGpaRef.current) {
      setGpaTextWidth(Math.max(measureGpaRef.current.offsetWidth, 4));
    }
  }, [gpa]);

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

  // 이미지 Presigned URL 발급 및 S3 업로드 프로세서
  const processAndUploadImage = async (file: File) => {
    try {
      const fileName = file.name;
      const contentType = file.type || 'image/jpeg';

      // 1. Presigned URL 발급
      const presignedData = await getPresignedUrl(fileName, contentType, file.size);

      // 2. S3 직접 업로드 (PUT)
      await uploadImageToS3(presignedData.uploadUrl, file, contentType);

      // 3. 최종 저장용 fileUrl을 프로필 이미지 상태로 저장
      setProfileImg(presignedData.fileUrl);
      toast.success('프로필 이미지가 성공적으로 업로드되었습니다.');
    } catch (err) {
      console.error('S3 이미지 업로드 실패 (로컬 프리뷰 폴백):', err);
      // S3 API 미구현 시 로컬 FileReader 프리뷰로 안전하게 폴백
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result as string);
        toast.success('프로필 이미지가 선택되었습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  // 갤러리/파일 선택기 이미지 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadImage(file);
    }
  };

  // 실시간 카메라 캡처 이미지 업로드 핸들러
  const handleCameraCapture = (dataUrl: string) => {
    const file = dataURLtoFile(dataUrl, `camera_${Date.now()}.jpg`);
    processAndUploadImage(file);
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
            내 프로필
          </h1>
        </header>
      }
      className="bg-white"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col min-h-[calc(100dvh-3.5rem)] px-[20px] pb-6 justify-between"
      >
        {/* 상단 폼 입력부 */}
        <div className="space-y-0 w-full">
          {/* 1. 프로필 이미지 편집 영역 */}
          <div className="flex flex-col items-center justify-center mt-[20px]">
            <div className="relative w-[101px] h-[101px]">
              <div className="w-[101px] h-[101px] overflow-hidden rounded-full">
                <img
                  src={profileImg || defaultPersonImg}
                  onError={(e) => {
                    e.currentTarget.src = defaultPersonImg;
                  }}
                  alt="프로필 미리보기"
                  className="size-full object-cover"
                />
              </div>
              {/* 카메라 토글 버튼 */}
              <button
                type="button"
                onClick={() => setActiveBottomSheet('photo')}
                className="absolute bottom-0 right-0 w-[26px] h-[26px] flex items-center justify-center rounded-full bg-[#F2F2F2] border-[2px] border-white p-[1px] shadow-none hover:bg-[#E5E5E5] active:scale-95 transition-all z-10"
              >
                <img src={cameraIcon} className="w-[14px] h-[13px]" alt="카메라" />
              </button>
            </div>
            <h2 className="mt-[12px] text-lg font-semibold text-gray-800 leading-tight">
              {profileDetail?.name}
            </h2>
            <p className="mt-[10px] text-xs font-medium text-gray-400 leading-none">
              {profileDetail?.universityName}
            </p>
          </div>

          {/* 2. 학업 정보 설정 */}
          <section className="mt-[16px]">
            <h3 className="w-full h-[45px] pt-[10px] pb-[10px] flex items-center text-[18px] font-semibold leading-[140%] tracking-[0px] text-[#1E1E1E]">
              학업 정보
            </h3>

            {/* GPA & 소득구간 입력부 (유동 너비 flex-1 적용) */}
            <div className="flex gap-[12px] mt-[8px] w-full">
              {/* GPA 입력 */}
              <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium leading-[140%] tracking-[0px] text-[#A5A5A5] flex items-center">
                  현재 학점 (GPA)
                </label>
                <div
                  onClick={() => gpaInputRef.current?.focus()}
                  className="relative w-full h-[48px] rounded-[12px] border border-gray-200 bg-white py-[12px] px-[15px] flex items-center cursor-text transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
                >
                  {/* 숨겨진 텍스트 너비 측정용 span */}
                  <span
                    ref={measureGpaRef}
                    className="absolute -top-[9999px] -left-[9999px] text-[16px] font-medium leading-[140%] tracking-[-0.24px] whitespace-pre opacity-0 pointer-events-none"
                    aria-hidden="true"
                  >
                    {String(gpa || '') || '0.00'}
                  </span>

                  <div className="flex items-center">
                    <input
                      ref={gpaInputRef}
                      type="text"
                      inputMode="decimal"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: `${gpaTextWidth}px`,
                      }}
                      className="bg-transparent text-[16px] font-medium leading-[140%] text-[#1E1E1E] focus:outline-none p-0 m-0 border-0 tracking-[-0.24px]"
                    />
                    <span className="text-[16px] font-medium leading-[140%] text-[#8C8C8C] select-none tracking-[-0.24px] p-0 m-0">
                      /4.5
                    </span>
                  </div>
                </div>
              </div>

              {/* 소득구간 선택 */}
              <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
                <label className="text-[14px] font-medium leading-[140%] tracking-[0px] text-[#A5A5A5] flex items-center">
                  소득구간
                </label>
                <button
                  type="button"
                  onClick={() => setActiveBottomSheet('income')}
                  className="w-full h-[48px] rounded-[12px] border border-gray-200 bg-white py-[12px] px-[15px] flex items-center justify-between hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 active:scale-[0.98] transition-all text-left focus:outline-none"
                >
                  <span className="text-[16px] font-medium leading-[140%] tracking-[-0.24px] text-[#1E1E1E]">
                    {incomeBracket}구간
                  </span>
                  <svg
                    width="6"
                    height="11"
                    viewBox="0 0 6 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <path
                      d="M1 1L5 5.5L1 10"
                      stroke="#A5A5A5"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* 3. 맞춤 핏 조건 설정 */}
          <section className="mt-[28px]">
            <h3 className="text-[18px] font-semibold leading-[140%] tracking-[0px] text-[#1E1E1E]">
              맞춤 핏 조건 설정
            </h3>

            {/* 관심 직무 및 분야 */}
            <div className="mt-[18px]">
              <label className="text-[14px] font-medium leading-[140%] tracking-[0px] text-[#A5A5A5] select-none block">
                관심 직무 및 분야
              </label>

              {/* 선택 칩 세트 (가로 스크롤 가능) */}
              <div className="flex flex-row gap-[5px] mt-[6px] w-full overflow-x-auto whitespace-nowrap scrollbar-none py-1">
                {AVAILABLE_FIELDS.map((field) => {
                  const selected = interests.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => handleToggleField(field)}
                      className={`h-[36px] px-[14px] py-[8px] rounded-full text-[14px] font-medium leading-[140%] tracking-[0px] flex items-center justify-center shrink-0 transition-all ${
                        selected
                          ? 'bg-[#0059FF] text-white shadow-sm'
                          : 'bg-white text-[#A5A5A5] border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {field.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 희망 활동 지역 */}
            <div className="mt-[12px] w-full">
              <label className="text-[14px] font-medium leading-[140%] tracking-[0px] text-[#A5A5A5] select-none block mb-[12px]">
                희망 활동 지역
              </label>
              <button
                type="button"
                onClick={() => setActiveBottomSheet('region')}
                className="w-full h-[48px] rounded-[12px] border border-gray-200 bg-white py-[12px] px-[15px] flex items-center justify-between shadow-sm hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 active:scale-[0.98] transition-all text-left focus:outline-none"
              >
                <span className="text-[16px] font-medium leading-[140%] tracking-[-0.24px] text-[#1E1E1E]">
                  {region}
                </span>
                <svg
                  width="6"
                  height="11"
                  viewBox="0 0 6 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <path
                    d="M1 1L5 5.5L1 10"
                    stroke="#737373"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </section>
        </div>

        {/* 하단 저장하기 버튼 */}
        <div className="mt-10 mb-2 w-full">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-[56px] bg-[#0059FF] hover:bg-blue-700 text-white font-semibold rounded-xl text-[18px] leading-[140%] tracking-[0px] text-center transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
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

      {/* 이미지 업로드 방식 바텀시트 모달 (iOS 액션시트 디자인) */}
      {activeBottomSheet === 'photo' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-[8px] pb-[58px] animate-fade-in-up">
          <div className="absolute inset-0" onClick={() => setActiveBottomSheet(null)} />

          <div className="relative w-full max-w-[386px] flex flex-col gap-[16px] z-10">
            {/* 상단 옵션 그룹 카드 */}
            <div className="w-full overflow-hidden rounded-[13px] bg-[#F2F2F7]/90 backdrop-blur-[22px] shadow-lg flex flex-col">
              {/* 타이틀 안내 문구 */}
              <div className="flex items-center justify-center border-b border-[#D1D1D6]/70 py-[12px] px-4 text-center text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-[#3C3C4399] select-none shrink-0">
                이미지 업로드 방식을 선택해주세요.
              </div>

              {/* 직접 촬영 (위아래 18px 패딩) */}
              <button
                type="button"
                onClick={() => {
                  setActiveBottomSheet(null);
                  setIsCameraModalOpen(true);
                }}
                className="flex w-full items-center justify-center border-b border-[#D1D1D6]/70 py-[18px] px-[16px] text-[20px] font-normal leading-[24px] tracking-[0.38px] text-[#007AFF] transition-colors hover:bg-black/5 active:bg-black/10 text-center"
              >
                직접 촬영
              </button>

              {/* 갤러리에서 선택 (위아래 18px 패딩) */}
              <button
                type="button"
                onClick={() => {
                  setActiveBottomSheet(null);
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center justify-center py-[18px] px-[16px] text-[20px] font-normal leading-[24px] tracking-[0.38px] text-[#007AFF] transition-colors hover:bg-black/5 active:bg-black/10 text-center"
              >
                갤러리에서 선택
              </button>
            </div>

            {/* 하단 확인 버튼 (386 x 60, radius: 13px, padding: 18px 16px) */}
            <button
              type="button"
              onClick={() => setActiveBottomSheet(null)}
              className="flex h-[60px] w-full items-center justify-center rounded-[13px] bg-white py-[18px] px-[16px] text-[20px] font-semibold leading-[24px] tracking-[0.38px] text-[#007AFF] shadow-lg transition-colors hover:bg-gray-50 active:bg-gray-100 text-center"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 소득구간 선택 바텀시트 모달 */}
      {activeBottomSheet === 'income' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0">
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0">
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
        onCapture={handleCameraCapture}
      />
    </Layout>
  );
}
