import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '@/shared/layouts/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import EmailLoginPage from '@/pages/EmailLoginPage';
import HomePage from '@/pages/HomePage';
import SignupPage from '@/pages/SignupPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/login/email', element: <EmailLoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  { path: '/', element: <HomePage /> },
]);
