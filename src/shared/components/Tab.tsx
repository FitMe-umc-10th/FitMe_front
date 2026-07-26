type TabItem<T extends string> = {
  label: string;
  value: T;
};

type TabProps<T extends string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
  variant?: 'equal' | 'content';
};

export function Tab<T extends string>({ tabs, active, onChange, variant = 'equal' }: TabProps<T>) {
  const isContentVariant = variant === 'content';

  return (
    <div className={`flex border-b bg-white ${isContentVariant ? 'border-[#D9D9D9] pl-5' : 'border-[#EEF0F3]'}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative h-[43px] font-semibold transition-colors ${
              isContentVariant ? 'px-3' : 'flex-1'
            } ${isContentVariant ? 'text-[18px] leading-[1.4]' : 'text-[14px]'} ${
              isActive ? 'text-[#1E1E1E]' : 'text-[#A5A5A5]'
            } ${
              isContentVariant && tab.label.length > 2 ? 'min-w-[67px]' : ''
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                className={`absolute bottom-0 h-0.5 bg-[#0059FF] ${
                  isContentVariant ? 'inset-x-0' : 'inset-x-3 rounded-full'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
