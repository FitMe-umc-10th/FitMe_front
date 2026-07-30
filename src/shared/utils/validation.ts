import { z } from 'zod';

// ============================================================================
// 1. 이메일 (Email) 유효성 검사
// ============================================================================
export const emailSchema = z
  .string()
  .trim()
  .min(1, '이메일 주소를 입력해 주세요.')
  .email('올바른 이메일 형식을 입력해 주세요. (예: example@fitme.com)')
  .superRefine((val, ctx) => {
    const atIndex = val.lastIndexOf('@');
    if (atIndex === -1) return;

    const domain = val.slice(atIndex + 1).toLowerCase();

    // 1. 대표 포털 사이트 오탈자 검사 (naver.co, gmail.co 등)
    if (domain.startsWith('naver.') && domain !== 'naver.com') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '네이버 이메일은 @naver.com 형식이어야 합니다.',
      });
      return;
    }
    if (domain.startsWith('gmail.') && domain !== 'gmail.com') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '지메일은 @gmail.com 형식이어야 합니다.',
      });
      return;
    }
    if (domain.startsWith('daum.') && domain !== 'daum.net') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '다음 이메일은 @daum.net 형식이어야 합니다.',
      });
      return;
    }
    if (domain.startsWith('hanmail.') && domain !== 'hanmail.net') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '한메일은 @hanmail.net 형식이어야 합니다.',
      });
      return;
    }
    if (domain.startsWith('kakao.') && domain !== 'kakao.com') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '카카오 이메일은 @kakao.com 형식이어야 합니다.',
      });
      return;
    }
    if (domain.startsWith('nate.') && domain !== 'nate.com') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '네이트 이메일은 @nate.com 형식이어야 합니다.',
      });
      return;
    }

    // 2. 최상위 도메인(TLD) 완결성 검사 (.com, .net, .org, .co.kr, .ac.kr 등)
    const validTldRegex =
      /\.(com|net|org|edu|gov|kr|co\.kr|ac\.kr|go\.kr|or\.kr|pe\.kr|re\.kr|io|dev|ai|me|app)$/i;
    if (!validTldRegex.test(domain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '올바른 도메인(예: .com, .net, .co.kr 등)으로 완료해 주세요.',
      });
    }
  });

export const validateEmail = (email: string): string => {
  const result = emailSchema.safeParse(email);
  return result.success ? '' : result.error.issues[0]?.message || '올바른 이메일 형식이 아닙니다.';
};

// ============================================================================
// 2. 이름 (Name) 유효성 검사
// ============================================================================
export const nameSchema = z.string().trim().min(1, '이름을 입력해주세요');

export const validateName = (name: string): string => {
  const result = nameSchema.safeParse(name);
  return result.success ? '' : result.error.issues[0]?.message || '이름을 입력해주세요.';
};

// ============================================================================
// 3. 생년월일 (Birth) 유효성 검사 (YYYY.MM.DD)
// ============================================================================
export const birthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}\.\d{2}\.\d{2}$/, 'YYYY.MM.DD 형식으로 입력해주세요');

export const validateBirth = (birth: string): string => {
  const result = birthSchema.safeParse(birth);
  return result.success ? '' : result.error.issues[0]?.message || 'YYYY.MM.DD 형식으로 입력해주세요.';
};

// ============================================================================
// 4. 비밀번호 (Password) 유효성 검사
// ============================================================================
export const passwordSchema = z
  .string()
  .min(7, '7자 이상 입력해주세요')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    '영어·숫자·특수문자를 모두 포함해주세요',
  );

export const validatePassword = (password: string): string => {
  const result = passwordSchema.safeParse(password);
  return result.success ? '' : result.error.issues[0]?.message || '비밀번호 형식이 올바르지 않습니다.';
};

// ============================================================================
// 5. 약관 동의 (Agree) 유효성 검사
// ============================================================================
export const agreeSchema = z.boolean().refine((v) => v === true, { message: '약관에 동의해주세요' });

// ============================================================================
// 6. 회원가입 종합 (Signup) Zod 스키마
// ============================================================================
export const signupSchema = z
  .object({
    name: nameSchema,
    birth: birthSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    agree: agreeSchema,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않아요',
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// ============================================================================
// 7. 학점 (GPA) 유효성 검사 (0.0 ~ 4.5)
// ============================================================================
export const gpaSchema = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
  .refine((num) => !isNaN(num) && num >= 0 && num <= 4.5, {
    message: '학점은 0 ~ 4.5 사이로 입력해 주세요.',
  });

export const validateGpa = (gpa: number | string): string => {
  const result = gpaSchema.safeParse(gpa);
  return result.success ? '' : result.error.issues[0]?.message || '학점은 0 ~ 4.5 사이로 입력해 주세요.';
};

// ============================================================================
// 8. 1:1 문의 내용 (Inquiry) 유효성 검사
// ============================================================================
export const inquiryContentSchema = z
  .string()
  .trim()
  .min(1, '상세 문의 내용을 입력해 주세요.')
  .max(500, '문의 내용은 최대 500자까지 입력 가능합니다.');

export const inquirySchema = z.object({
  replyEmail: emailSchema,
  content: inquiryContentSchema,
});

export const validateInquiry = (
  replyEmail: string,
  content: string,
): { emailError: string; contentError: string } => {
  const emailResult = emailSchema.safeParse(replyEmail);
  const contentResult = inquiryContentSchema.safeParse(content);

  return {
    emailError: emailResult.success ? '' : emailResult.error.issues[0]?.message || '',
    contentError: contentResult.success ? '' : contentResult.error.issues[0]?.message || '',
  };
};
