import { createBrowserRouter } from 'react-router-dom';
import ExplorePage from '@/pages/ExplorePage';
import HomePage from '@/pages/HomePage';
import NotificationPage from '@/pages/NotificationPage';
import PostingDetailPage from '@/pages/PostingDetailPage';
import RecentViewedPage from '@/pages/RecentViewedPage';
import SavedPage from '@/pages/SavedPage';

// TODO: 화면 추가될 때마다 라우트 등록
// 인증 페이지(/login, /signup, /onboarding)는 별도 레이아웃(GNB 없음)
// 공통 레이아웃(GNB) 안에 / /explore /saved /history /my, 공유 /postings/:id
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
