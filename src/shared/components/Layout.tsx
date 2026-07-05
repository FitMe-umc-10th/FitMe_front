import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  tabBar?: ReactNode;
  className?: string;
};

export function Layout({ children, header, tabBar, className = '' }: LayoutProps) {
  return (
    <div className="min-h-dvh bg-gray-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white">
        {header}
        <main className={`flex-1 ${tabBar ? 'pb-20' : ''} ${className}`}>{children}</main>
        {tabBar}
      </div>
    </div>
  );
}
