import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '@/shared/layouts/AuthLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import EmailLoginPage from '@/pages/EmailLoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ExplorePage from '@/pages/ExplorePage';
import HomePage from '@/pages/HomePage';
import NotificationPage from '@/pages/NotificationPage';
import PostingDetailPage from '@/pages/PostingDetailPage';
import RecentViewedPage from '@/pages/RecentViewedPage';
import SavedPage from '@/pages/SavedPage';

export const router = createBrowserRouter([
  // 인증 화면 (누구나 접근 가능)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/login/email', element: <EmailLoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
    ],
  },
  // 보호된 화면 (로그인 + 온보딩 완료해야 접근)
  {
    element: <ProtectedRoute />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  {
    path: '/explore',
    element: <ExplorePage />,
  },
  {
    path: '/saved',
    element: <SavedPage />,
  },
  {
    path: '/notifications',
    element: <NotificationPage />,
  },
  {
    path: '/recent-postings',
    element: <RecentViewedPage />,
  },
  {
    path: '/postings/:postingId',
    element: <PostingDetailPage />,
  },
]);
