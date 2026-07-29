import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '@/shared/layouts/AuthLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import EmailLoginPage from '@/pages/EmailLoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ExplorePage from '@/pages/ExplorePage';
import HomePage from '@/pages/HomePage';
import NotificationList from '@/features/notification/NotificationList';
import PostingDetailPage from '@/pages/PostingDetailPage';
import SavedPage from '@/pages/SavedPage';

import MyPageMain from '@/features/mypage/MyPageMain';
import ProfileEdit from '@/features/mypage/ProfileEdit';
import NotificationSettings from '@/features/mypage/NotificationSettings';
import CustomerSupport from '@/features/mypage/CustomerSupport';
import NoticeList from '@/features/mypage/AnnouncementPage';
import HistoryList from '@/features/history/HistoryList';
import HistoryDetail from '@/features/history/HistoryDetail';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';

export const router = createBrowserRouter([
  // 인증 화면 (누구나 접근 가능)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/login/email', element: <EmailLoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/login/email', element: <EmailLoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/oauth2/callback', element: <OAuthCallbackPage /> }, // ← 추가
    ],
  },
  // 보호된 화면 (로그인 + 온보딩 완료해야 접근)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '/notifications', element: <NotificationList /> },
      { path: '/postings/:postingId', element: <PostingDetailPage /> },

      // 마이페이지
      { path: '/my', element: <MyPageMain /> },
      { path: '/my/profile', element: <ProfileEdit /> },
      { path: '/my/notifications', element: <NotificationSettings /> },
      { path: '/my/support', element: <CustomerSupport /> },
      { path: '/my/notices', element: <NoticeList /> },

      // 이력
      { path: '/history', element: <HistoryList /> },
      { path: '/history/:id', element: <HistoryDetail /> },
    ],
  },
]);
