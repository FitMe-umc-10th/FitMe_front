import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);

  // 1) 로그인 안 했으면 → 로그인으로
  if (!accessToken) return <Navigate to="/login" replace />;

  // 2) 로그인은 했는데 온보딩 안 했으면 → 온보딩으로
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;

  // 3) 둘 다 됐으면 → 자식 화면(홈 등) 보여줌
  return <Outlet />;
}
