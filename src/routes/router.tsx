import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '@/shared/layouts/AuthLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';

// 인증 화면: 첫 진입에 바로 필요하므로 정적 import 유지
import LoginPage from '@/pages/LoginPage';
import EmailLoginPage from '@/pages/EmailLoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';

// 로그인 이후 화면: 코드 스플리팅(lazy)으로 필요한 시점에만 로드
const HomePage = lazy(() => import('@/pages/HomePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const SavedPage = lazy(() => import('@/pages/SavedPage'));
const RecentViewedPage = lazy(() => import('@/pages/RecentViewedPage'));
const PostingDetailPage = lazy(() => import('@/pages/PostingDetailPage'));
const NotificationList = lazy(() => import('@/features/notification/NotificationList'));
const MyPageMain = lazy(() => import('@/features/mypage/MyPageMain'));
const ProfileEdit = lazy(() => import('@/features/mypage/ProfileEdit'));
const NotificationSettings = lazy(() => import('@/features/mypage/NotificationSettings'));
const CustomerSupport = lazy(() => import('@/features/mypage/CustomerSupport'));
const NoticeList = lazy(() => import('@/features/mypage/AnnouncementPage'));
const HistoryList = lazy(() => import('@/features/history/HistoryList'));
const HistoryDetail = lazy(() => import('@/features/history/HistoryDetail'));

// lazy 컴포넌트는 로딩 중 대체 화면(Suspense)이 필요하다
const withSuspense = (node: ReactNode) => (
  <Suspense
    fallback={
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-[14px] text-[#606060]">불러오는 중...</p>
      </div>
    }
  >
    {node}
  </Suspense>
);

export const router = createBrowserRouter([
  // 인증 화면 (누구나 접근 가능)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/login/email', element: <EmailLoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/oauth2/callback', element: <OAuthCallbackPage /> }, // OAuth 로그인 후 리다이렉트되는 페이지
    ],
  },
  // 보호된 화면 (로그인 + 온보딩 완료해야 접근)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/explore', element: withSuspense(<ExplorePage />) },
      { path: '/saved', element: withSuspense(<SavedPage />) },
      { path: '/notifications', element: withSuspense(<NotificationList />) },
      { path: '/recent-postings', element: withSuspense(<RecentViewedPage />) },
      { path: '/postings/:postingId', element: withSuspense(<PostingDetailPage />) },

      // 마이페이지
      { path: '/my', element: withSuspense(<MyPageMain />) },
      { path: '/my/profile', element: withSuspense(<ProfileEdit />) },
      { path: '/my/notifications', element: withSuspense(<NotificationSettings />) },
      { path: '/my/support', element: withSuspense(<CustomerSupport />) },
      { path: '/my/notices', element: withSuspense(<NoticeList />) },

      // 이력
      { path: '/history', element: withSuspense(<HistoryList />) },
      { path: '/history/:id', element: withSuspense(<HistoryDetail />) },
    ],
  },
]);
