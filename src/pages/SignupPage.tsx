import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Logo } from '@/shared/components/Logo';
import { useToastStore } from '@/store/toastStore';
import { signup, sendEmailCode, verifyEmailCode } from '@/apis/auth';
import TermsAgreement from '@/shared/components/TermsAgreement';
import eyeIcon from '@/assets/icons/eye.svg';
import {
  signupSchema,
  emailSchema,
  type SignupFormValues as SignupForm,
} from '@/shared/utils/validation';

// Figma 공통 스타일 (인풋 border #D9D9D9, radius 10px, 포커스 시 파란 테두리)
const inputClass =
  'h-12 w-full rounded-[10px] border border-[#D9D9D9] px-4 text-[16px] text-[#262626] placeholder:text-[#A5A5A5] outline-none focus:border-[#0059FF]';
const labelClass = 'mb-2 block text-[16px] font-medium text-[#262626]';

export default function SignupPage() {
  const navigate = useNavigate();
  const toast = useToastStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  // 이메일 인증 — RHF 밖 상태
  const [codeSent, setCodeSent] = useState(false); // 인증번호 전송됨
  const [code, setCode] = useState(''); // 입력한 인증번호
  const [isVerified, setIsVerified] = useState(false); // 인증 완료
  const [showPw, setShowPw] = useState(false); // 비밀번호 보기 토글
  const [showPwConfirm, setShowPwConfirm] = useState(false); // 비밀번호 확인 보기 토글

  // 이메일 형식 맞아야 "인증번호 전송" 버튼 활성화
  const emailValue = watch('email') ?? '';
  const emailFormatValid = emailSchema.safeParse(emailValue).success;

  // 인증번호 발송
  //예외처리 추가
  const sendCode = async () => {
    try {
      await sendEmailCode(watch('email'));
      setCodeSent(true); // 버튼 텍스트 '재전송'으로, 인증칸 열림
      toast.success('인증번호를 전송했어요');
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error('이미 가입된 이메일이에요. 로그인 또는 소셜 로그인을 이용해주세요.');
      } else {
        toast.error('인증번호 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 인증번호 확인
  // 예외처리 추가
  const verifyCode = async () => {
    try {
      const ok = await verifyEmailCode(watch('email'), code);
      if (ok) {
        setIsVerified(true); // 인증 완료 → 칸 잠기고 '인증 완료' 표시
        toast.success('인증 완료');
      } else {
        toast.error('인증번호가 일치하지 않아요. 다시 확인해주세요.');
      }
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        toast.error('인증번호가 올바르지 않거나 만료되었어요.');
      } else {
        toast.error('인증 확인에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup({
        name: data.name,
        birth: data.birth.replace(/\./g, '-'), // "2026.07.22" → "2026-07-22"
        email: data.email,
        verificationCode: code, // 인증번호 (별도 state)
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        privacyPolicyAgreed: data.agree,
      });
      toast.success('회원가입이 완료되었어요!');
      navigate('/login');
    } catch {
      // 409(이메일 중복), 400(유효성) 등 에러 처리
      toast.error('회원가입에 실패했어요. 다시 확인해주세요.');
    }
  };

  // 폼 통과 + 인증 완료 시 가입 버튼 활성화
  const canSubmit = isValid && isVerified;

  return (
    <div className="relative min-h-dvh pb-28">
      {/* 상단 로고 (Figma: 헤더 왼쪽 작은 로고) */}
      <div className="flex items-center px-5 pt-4">
        <Logo className="h-6 w-[64px]" />
      </div>

      {/* 헤더: 뒤로가기 + 회원가입 (중앙) */}
      <div className="relative flex h-12 items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-5 text-2xl text-gray-800"
        >
          ‹
        </button>
        <h1 className="text-[20px] font-semibold text-[#111827]">회원가입</h1>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-5 pt-4">
        {/* 이름 */}
        <div>
          <label className={labelClass}>이름</label>
          <Controller
            control={control}
            name="name"
            defaultValue=""
            render={({ field, fieldState }) => (
              <>
                <input {...field} placeholder="홍길동" className={inputClass} />
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* 생년월일 */}
        <div>
          <label className={labelClass}>생년월일</label>
          <Controller
            control={control}
            name="birth"
            defaultValue=""
            render={({ field, fieldState }) => (
              <>
                <input
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const prev = field.value ?? '';
                    const isDeleting = raw.length < prev.length; // 지우는 중인지

                    const digits = raw.replace(/\D/g, '').slice(0, 8); // 숫자만, 최대 8자리
                    let formatted = digits;
                    if (digits.length >= 6) {
                      // YYYY.MM.DD (월 두 자리 끝나면 점 자동)
                      formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
                    } else if (digits.length >= 4) {
                      // YYYY. (연도 네 자리 끝나면 점 자동)
                      formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`;
                    }

                    // 지우는 중인데 마침 끝에 점이 붙었으면 점 제거 (백스페이스로 지워지게)
                    if (isDeleting && formatted.endsWith('.')) {
                      formatted = formatted.slice(0, -1);
                    }

                    field.onChange(formatted);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  inputMode="numeric"
                  placeholder="YYYY.MM.DD"
                  className={inputClass}
                />
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* 이메일 + 인증번호 전송 */}
        <div>
          <label className={labelClass}>이메일</label>
          <Controller
            control={control}
            name="email"
            defaultValue=""
            render={({ field, fieldState }) => (
              <>
                <div className="flex items-center gap-1">
                  <input
                    {...field}
                    type="email"
                    placeholder="abcdefg@gmail.com"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={!emailFormatValid}
                    onClick={sendCode}
                    className={`h-12 shrink-0 rounded-lg px-3 text-[10px] font-medium text-white ${
                      emailFormatValid ? 'bg-[#0059FF]' : 'bg-[#D9D9D9]'
                    }`}
                  >
                    {codeSent ? '재전송' : '인증번호 전송'}
                  </button>
                </div>
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* 인증번호 입력 + 인증하기 */}
        <div>
          <label className={labelClass}>인증번호 입력</label>
          <div className="flex items-center gap-1">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isVerified}
              placeholder="인증번호 여섯 자리를 입력해주세요"
              className={`${inputClass} disabled:bg-gray-100`}
            />
            <button
              type="button"
              disabled={!codeSent || isVerified}
              onClick={verifyCode}
              className={`h-12 shrink-0 rounded-lg px-3 text-[10px] font-medium text-white ${
                codeSent && !isVerified ? 'bg-[#0059FF]' : 'bg-[#D9D9D9]'
              }`}
            >
              {isVerified ? '인증 완료' : '인증 하기'}
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label className={labelClass}>비밀번호</label>
          <Controller
            control={control}
            name="password"
            defaultValue=""
            render={({ field, fieldState }) => (
              <>
                <div className="relative">
                  <input
                    {...field}
                    type={showPw ? 'text' : 'password'}
                    placeholder="영어 + 숫자 + 특수문자 도합 7자 이상"
                    className={`${inputClass} pr-11`}
                  />
                  {/* 비밀번호 보기 눈 토글 */}
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <img
                      src={eyeIcon}
                      alt=""
                      aria-hidden="true"
                      className={`size-5 ${showPw ? 'opacity-100' : 'opacity-40'}`}
                    />
                  </button>
                </div>
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className={labelClass}>비밀번호 확인</label>
          <Controller
            control={control}
            name="passwordConfirm"
            defaultValue=""
            render={({ field, fieldState }) => (
              <>
                <div className="relative">
                  <input
                    {...field}
                    type={showPwConfirm ? 'text' : 'password'}
                    placeholder="영어 + 숫자 + 특수문자 도합 7자 이상"
                    className={`${inputClass} pr-11`}
                  />
                  {/* 비밀번호 확인 보기 눈 토글 */}
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <img
                      src={eyeIcon}
                      alt=""
                      aria-hidden="true"
                      className={`size-5 ${showPwConfirm ? 'opacity-100' : 'opacity-40'}`}
                    />
                  </button>
                </div>
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* 약관 동의 (아코디언) */}
        <Controller
          control={control}
          name="agree"
          defaultValue={false}
          render={({ field }) => <TermsAgreement onRequiredChange={field.onChange} />}
        />
      </form>

      {/* 가입하기: 폼 통과 + 인증 완료 시 활성화 (Figma: 하단 고정) */}
      <div className="absolute inset-x-5 bottom-[46px]">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={!canSubmit}
          className={`h-14 w-full rounded-xl text-[18px] font-semibold text-white transition-colors ${
            canSubmit ? 'bg-[#0059FF]' : 'bg-[#D9D9D9]'
          }`}
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
