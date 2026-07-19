import { NavLink } from 'react-router-dom';

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
                `flex h-full flex-col items-center justify-center gap-1 text-[12px] font-semibold transition-colors ${
                  isActive ? 'text-[#0059FF]' : 'text-[#A5A5A5]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex size-7 items-center justify-center">
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
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
      {name === 'home' && (
        <>
          <path
            d="M3 12H5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V12H21L12 3L3 12Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M9 21V15C9 14.4696 9.21071 13.9609 9.58579 13.5858C9.96086 13.2107 10.4696 13 11 13H13C13.5304 13 14.0391 13.2107 14.4142 13.5858C14.7893 13.9609 15 14.4696 15 15V21"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </>
      )}
      {name === 'search' && (
        <g transform="scale(0.923)">
          <path
            d="M16.7913 15.1682H15.9354L15.6321 14.8757C16.3091 14.0892 16.8039 13.1627 17.0811 12.1626C17.3583 11.1626 17.411 10.1136 17.2354 9.09073C16.7263 6.07906 14.2129 3.67406 11.1796 3.30573C10.1132 3.17081 9.03004 3.28165 8.01305 3.62974C6.99606 3.97783 6.07217 4.55396 5.31209 5.31404C4.55201 6.07412 3.97588 6.99801 3.62779 8.015C3.27969 9.032 3.16886 10.1151 3.30377 11.1816C3.67211 14.2149 6.07711 16.7282 9.08877 17.2374C10.1116 17.4129 11.1606 17.3603 12.1607 17.0831C13.1608 16.8059 14.0872 16.3111 14.8738 15.6341L15.1663 15.9374V16.7932L19.7704 21.3974C20.2146 21.8416 20.9404 21.8416 21.3846 21.3974C21.8288 20.9532 21.8288 20.2274 21.3846 19.7832L16.7913 15.1682ZM10.2913 15.1682C7.59377 15.1682 5.41627 12.9907 5.41627 10.2932C5.41627 7.59573 7.59377 5.41823 10.2913 5.41823C12.9888 5.41823 15.1663 7.59573 15.1663 10.2932C15.1663 12.9907 12.9888 15.1682 10.2913 15.1682Z"
            fill="currentColor"
          />
        </g>
      )}
      {name === 'saved' && (
        <path
          d="M19.4993 12.5717L11.9993 19.9997L4.49932 12.5717C4.00463 12.0903 3.61497 11.5117 3.35487 10.8723C3.09478 10.2329 2.96989 9.54664 2.98806 8.85662C3.00624 8.1666 3.16709 7.48782 3.46048 6.86303C3.75388 6.23823 4.17346 5.68094 4.69281 5.22627C5.21216 4.77159 5.82003 4.42938 6.47814 4.22117C7.13624 4.01296 7.83033 3.94327 8.51669 4.01649C9.20306 4.08971 9.86682 4.30425 10.4662 4.64659C11.0656 4.98894 11.5876 5.45169 11.9993 6.00569C12.4129 5.45571 12.9355 4.99701 13.5344 4.65829C14.1334 4.31958 14.7958 4.10814 15.4803 4.03721C16.1647 3.96628 16.8564 4.03739 17.5121 4.24608C18.1678 4.45477 18.7734 4.79656 19.2909 5.25005C19.8084 5.70354 20.2268 6.25897 20.5197 6.88158C20.8127 7.50419 20.9741 8.18057 20.9936 8.8684C21.0132 9.55622 20.8906 10.2407 20.6335 10.8789C20.3763 11.5172 19.9902 12.0955 19.4993 12.5777"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      )}
      {name === 'history' && (
        <>
          <path
            d="M3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M12 7V12L15 15"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </>
      )}
      {name === 'my' && (
        <>
          <path
            d="M12 13.875C14.6924 13.875 16.875 11.6924 16.875 9C16.875 6.30761 14.6924 4.125 12 4.125C9.30761 4.125 7.125 6.30761 7.125 9C7.125 11.6924 9.30761 13.875 12 13.875Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M4.125 21.375C4.125 17.625 7.125 13.875 12 13.875C16.875 13.875 19.875 17.625 19.875 21.375"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </>
      )}
    </svg>
  );
}
