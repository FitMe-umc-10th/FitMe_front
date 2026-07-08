// ============================================
// auth 관련 API 함수 모음
// 지금은 전부 mock(가짜 데이터)이고, 백엔드 Swagger 나오면
// 각 함수 안의 TODO 주석만 실제 axios 호출로 교체하면 됨.
// (컴포넌트는 이 함수들을 부르기만 하니까 안 건드려도 됨)
// ============================================

// import { axiosInstance } from './axiosInstance';  // 백엔드 나오면 주석 해제

// ===== 요청/응답 타입 정의 =====
// 로그인 요청 시 보내는 값
export interface LoginRequest {
  email: string;
  password: string;
}
// 로그인 성공 시 서버가 돌려주는 값
export interface LoginResponse {
  accessToken: string;
}
// 회원가입 요청 값
export interface SignupRequest {
  name: string;
  birth: string;
  email: string;
  password: string;
}
// 온보딩 저장 요청 값
export interface OnboardingRequest {
  residence: string;
  university: string;
  gpa: string;
  income: string;
  interests: string[];
}

// mock 지연 헬퍼: 실제 API처럼 살짝 기다리는 척 (기본 0.4초)
const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ===== 로그인 =====
export async function login(body: LoginRequest): Promise<LoginResponse> {
  // TODO: 실제 API 로 교체
  // return (await axiosInstance.post('/auth/login', body)).data;
  await mockDelay();
  return { accessToken: 'mock-access-token' }; // mock: 항상 성공
}

// ===== 회원가입 =====
export async function signup(body: SignupRequest): Promise<void> {
  // TODO: await axiosInstance.post('/auth/signup', body);
  await mockDelay();
  console.log('회원가입 요청:', body); // mock: 콘솔에만 찍음
}

// ===== 이메일 인증번호 발송 =====
export async function sendEmailCode(email: string): Promise<void> {
  // TODO: await axiosInstance.post('/auth/email/send', { email });
  await mockDelay();
  console.log('인증번호 발송:', email);
}

// ===== 이메일 인증번호 확인 =====
// 반환값 true = 인증 성공 / false = 실패
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  // TODO: return (await axiosInstance.post('/auth/email/verify', { email, code })).data.verified;
  await mockDelay();
  return code.length === 6; // mock: 6자리면 성공 처리
}

// ===== 온보딩 조건 저장 =====
export async function saveOnboarding(body: OnboardingRequest): Promise<void> {
  // TODO: await axiosInstance.post('/onboarding', body);
  await mockDelay();
  console.log('온보딩 저장:', body);
}
