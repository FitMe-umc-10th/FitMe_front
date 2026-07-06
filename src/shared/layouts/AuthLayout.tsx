import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div
      className="mx-auto min-h-dvh w-full max-w-[390px]"
      style={{ background: 'linear-gradient(to bottom, #e3edff, #ffffff 35%)' }}
    >
      <Outlet />
    </div>
  );
}
