// ============================================
// auth 관련 API 함수 모음
// 지금은 전부 mock(가짜 데이터)이고, 백엔드 Swagger 나오면
// 각 함수 안의 TODO 주석만 실제 axios 호출로 교체하면 됨.
// (컴포넌트는 이 함수들을 부르기만 하니까 안 건드려도 됨)
// ============================================

import { axiosInstance } from './axiosInstance'; // 백엔드 나오면 주석 해제
import axios from 'axios';

// ===== 요청/응답 타입 정의 =====
// 로그인 요청 시 보내는 값
export interface LoginRequest {
  email: string;
  password: string;
  keepLogin: boolean;
}
// 로그인 성공 시 서버가 돌려주는 값
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  member: {
    memberId: number;
    email: string;
    name: string;
    isOnboarded: boolean;
  };
}
// 회원가입 요청 타입 (Swagger 기준)
export interface SignupRequest {
  name: string;
  birth: string; // "2026-07-22" 형식
  email: string;
  verificationCode: string;
  password: string;
  passwordConfirm: string;
  privacyPolicyAgreed: boolean;
}
export interface OnboardingRequest {
  region: string;
  university: string;
  gpa: number; // ⚠️ 숫자
  incomeLevel: string;
  interests: string[];
  customInterests: string[]; // 직접입력
}
// ===== 로그인 =====
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post('/api/auth/login', body);
  return data.result; // { accessToken, refreshToken, member: { isOnboarded, ... }, ... }
}
// 회원가입
export async function signup(body: SignupRequest): Promise<void> {
  await axiosInstance.post('/api/auth/signup', body);
  // 성공하면 result에 { email, createdAt } 오지만 지금은 안 써도 됨
}

// ===== 이메일 인증번호 발송 =====
export async function sendEmailCode(email: string): Promise<void> {
  await axiosInstance.post('/api/auth/email-verifications', { email });
}

// ===== 이메일 인증번호 확인 =====
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const { data } = await axiosInstance.post('/api/auth/email-verifications/confirm', {
    email,
    verificationCode: code,
  });
  return data.result.isVerified; // 응답의 result.isVerified
}

// ===== 온보딩 조건 저장 =====
export async function saveOnboarding(body: OnboardingRequest): Promise<void> {
  await axiosInstance.post('/api/v1/onboarding', body);
}

// ===== 소셜 계정 연동 =====
// ⚠️ Authorization 헤더가 붙으면 백엔드가 예외 → 인터셉터 없는 순수 axios 사용
export async function linkAccount(linkToken: string): Promise<LoginResponse> {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/link`,
    null, // 바디 없음
    {
      headers: { 'Link-Token': `Bearer ${linkToken}` },
      withCredentials: true, // refreshToken 쿠키 수신용
    },
  );
  return data.result; // { accessToken, member: { name, isOnboarded, ... } }
}
