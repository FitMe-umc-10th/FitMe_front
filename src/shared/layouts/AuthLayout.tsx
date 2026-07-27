import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div
      className="mx-auto min-h-dvh w-full max-w-[402px]"
      style={{ background: 'linear-gradient(180deg, #E2EFFF 0%, #FFFFFF 36.54%)' }}
    >
      <Outlet />
    </div>
  );
}
