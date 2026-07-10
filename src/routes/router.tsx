import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import MyPageMain from '@/features/mypage/MyPageMain';
import ProfileEdit from '@/features/mypage/ProfileEdit';
import NotificationSettings from '@/features/mypage/NotificationSettings';
import CustomerSupport from '@/features/mypage/CustomerSupport';
import NoticeList from '@/features/mypage/NoticeList';
import NotificationList from '@/features/notification/NotificationList';
import ExplorePage from '@/pages/ExplorePage';

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
    path: '/my',
    element: <MyPageMain />,
  },
  {
    path: '/my/profile',
    element: <ProfileEdit />,
  },
  {
    path: '/my/notifications',
    element: <NotificationSettings />,
  },
  {
    path: '/my/support',
    element: <CustomerSupport />,
  },
  {
    path: '/my/notices',
    element: <NoticeList />,
  },
  {
    path: '/notifications',
    element: <NotificationList />,
  },
]);

