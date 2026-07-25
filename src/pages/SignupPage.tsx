import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import { Logo } from '@/shared/components/Logo';
import { useToastStore } from '@/store/toastStore';
import { signup, sendEmailCode, verifyEmailCode } from '@/apis/auth';

// 검증 규칙 (Zod)
const signupSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요'),
    birth: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/, 'YYYY.MM.DD 형식으로 입력해주세요'),
    email: z.string().email('올바른 이메일 형식이 아니에요'),
    password: z
      .string()
      .min(7, '7자 이상 입력해주세요')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        '영어·숫자·특수문자를 모두 포함해주세요',
      ),
    passwordConfirm: z.string(),
    agree: z.boolean().refine((v) => v === true, { message: '약관에 동의해주세요' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않아요',
  });

type SignupForm = z.infer<typeof signupSchema>;

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

  // 이메일 인증 (mock) — RHF 밖 상태
  const [codeSent, setCodeSent] = useState(false); // 인증번호 전송됨
  const [code, setCode] = useState(''); // 입력한 인증번호
  const [isVerified, setIsVerified] = useState(false); // 인증 완료

  // 이메일 형식 맞아야 "인증번호 전송" 버튼 활성화
  const emailValue = watch('email') ?? '';
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  // 인증번호 발송
  const sendCode = async () => {
    await sendEmailCode(watch('email')); // 현재 입력된 이메일로 발송
    setCodeSent(true); // 버튼 텍스트 '재전송'으로, 인증칸 열림
    toast.success('인증번호를 전송했어요 (mock)');
  };

  // 인증번호 확인
  const verifyCode = async () => {
    const ok = await verifyEmailCode(watch('email'), code); // mock: 6자리면 true
    if (ok) {
      setIsVerified(true); // 인증 완료 → 칸 잠기고 '인증 완료' 표시
      toast.success('인증 완료');
    } else {
      toast.error('인증번호 6자리를 입력해주세요');
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
    } catch (error) {
      // 409(이메일 중복), 400(유효성) 등 에러 처리
      toast.error('회원가입에 실패했어요. 다시 확인해주세요.');
    }
  };

  const labelClass = 'mb-1.5 block font-semibold text-gray-900';

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 상단 로고 */}
      <div className="px-4 pt-3">
        <Logo blink className="text-xl" />
      </div>

      {/* 헤더: 뒤로가기 + 회원가입 (중앙) */}
      <div className="relative flex h-12 items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-4 text-2xl text-gray-800"
        >
          ‹
        </button>
        <h1 className="text-lg font-bold">회원가입</h1>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6">
        {/* 이름 */}
        <div>
          <label className={labelClass}>이름</label>
          <Controller
            control={control}
            name="name"
            defaultValue=""
            render={({ field, fieldState }) => (
              <Input
                value={field.value}
                onChange={field.onChange}
                placeholder="홍길동"
                error={fieldState.error?.message}
              />
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
              <Input
                value={field.value}
                onChange={field.onChange}
                placeholder="YYYY.MM.DD"
                error={fieldState.error?.message}
              />
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
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="abcdefg@gmail.com"
                    type="email"
                    error={fieldState.error?.message}
                  />
                </div>
                <button
                  type="button"
                  disabled={!emailFormatValid}
                  onClick={sendCode}
                  className={`h-[50px] shrink-0 rounded-lg px-3 text-sm font-semibold ${
                    emailFormatValid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {codeSent ? '재전송' : '인증번호 전송'}
                </button>
              </div>
            )}
          />
        </div>

        {/* 인증번호 입력 + 인증하기 */}
        <div>
          <label className={labelClass}>인증번호 입력</label>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                value={code}
                onChange={setCode}
                placeholder="인증번호 여섯 자리를 입력해주세요"
                disabled={isVerified}
              />
            </div>
            <button
              type="button"
              disabled={!codeSent || isVerified}
              onClick={verifyCode}
              className={`h-[50px] shrink-0 rounded-lg px-3 text-sm font-semibold ${
                codeSent && !isVerified ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
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
              <Input
                value={field.value}
                onChange={field.onChange}
                placeholder="영어 + 숫자 + 특수문자 도합 7자 이상"
                type="password"
                error={fieldState.error?.message}
              />
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
              <Input
                value={field.value}
                onChange={field.onChange}
                placeholder="영어 + 숫자 + 특수문자 도합 7자 이상"
                type="password"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        {/* 약관 동의 */}
        <Controller
          control={control}
          name="agree"
          defaultValue={false}
          render={({ field }) => (
            <label className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              개인정보 보호 약관 동의
            </label>
          )}
        />

        {/* 가입하기: 폼 통과 + 인증 완료 시 활성화 */}
        <Button
          variant="primary"
          fullWidth
          disabled={!isValid || !isVerified}
          onClick={handleSubmit(onSubmit)}
        >
          가입하기
        </Button>
      </form>
    </div>
  );
}
