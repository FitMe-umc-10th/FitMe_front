import { NavLink } from 'react-router-dom';
import historyIcon from '@/assets/icons/gnb-history.svg';
import myIcon from '@/assets/icons/gnb-my.svg';
import savedIcon from '@/assets/icons/gnb-saved.svg';
import searchIcon from '@/assets/icons/gnb-search.svg';

type TabBarItem = {
  label: string;
  to: string;
  icon: 'home' | 'search' | 'saved' | 'history' | 'my';
};

const DEFAULT_ITEMS: TabBarItem[] = [
  { label: '홈', to: '/', icon: 'home' },
  { label: '탐색', to: '/explore', icon: 'search' },
  { label: '저장', to: '/saved', icon: 'saved' },
  { label: '이력', to: '/history', icon: 'history' },
  { label: '마이', to: '/my', icon: 'my' },
];

type TabBarProps = {
  items?: TabBarItem[];
};

export function TabBar({ items = DEFAULT_ITEMS }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 rounded-t-[28px] border border-b-0 border-gray-100 bg-white px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
      <ul className="grid h-16 grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex size-7 items-center justify-center rounded-full ${
                      isActive ? 'bg-blue-50' : 'bg-transparent'
                    }`}
                  >
                    <TabBarIcon name={item.icon} active={isActive} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type TabBarIconProps = {
  name: TabBarItem['icon'];
  active: boolean;
};

function TabBarIcon({ name, active }: TabBarIconProps) {
  const fill = active ? 'currentColor' : 'none';
  const assetIconMap = {
    search: searchIcon,
    saved: savedIcon,
    history: historyIcon,
    my: myIcon,
  } satisfies Partial<Record<TabBarItem['icon'], string>>;

  const assetIcon = assetIconMap[name as keyof typeof assetIconMap];

  if (assetIcon) {
    return (
      <span
        aria-hidden="true"
        className="block size-6 bg-current"
        style={{
          mask: `url(${assetIcon}) center / contain no-repeat`,
          WebkitMask: `url(${assetIcon}) center / contain no-repeat`,
        }}
      />
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      {name === 'home' && (
        <path
          d="M4 10.5L12 4L20 10.5V20H15V14H9V20H4V10.5Z"
          fill={fill}
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
      {name === 'search' && (
        <path
          d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18ZM16 16L20 20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
      {name === 'saved' && (
        <path
          d="M12 20C12 20 5 15.7 5 9.8C5 6.8 7.1 5 9.5 5C10.8 5 11.6 5.6 12 6.2C12.4 5.6 13.2 5 14.5 5C16.9 5 19 6.8 19 9.8C19 15.7 12 20 12 20Z"
          fill={fill}
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
      {name === 'history' && (
        <path
          d="M5 6H19M5 12H19M5 18H13"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      )}
      {name === 'my' && (
        <path
          d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM5 20C5.8 16.8 8.4 15 12 15C15.6 15 18.2 16.8 19 20"
          fill={name === 'my' && active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}
