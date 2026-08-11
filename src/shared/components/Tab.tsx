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
    <div
      className={
        isContentVariant
          ? 'flex h-[43px] w-full border-b-[0.5px] border-[#D9D9D9] bg-white pl-5'
          : 'flex h-[38px] w-full items-center justify-center gap-[90px] border-b-[0.5px] border-[#D9D9D9] bg-white'
      }
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative flex items-center justify-center transition-colors ${
              isContentVariant
                ? `h-[43px] px-[10px] py-[9px] text-center text-[18px] leading-[140%] ${
                    isActive ? 'font-semibold' : 'font-medium tracking-[-0.244565px]'
                  } ${tab.label.length > 2 ? 'min-w-[67px]' : 'min-w-[52px]'}`
                : `h-[38px] w-[134px] px-[10px] py-2 text-center text-[16px] leading-[140%] ${
                    isActive ? 'font-semibold' : 'font-medium'
                  }`
            } ${isActive ? 'text-[#1E1E1E]' : 'text-[#A5A5A5]'} ${
              !isContentVariant ? 'shrink-0' : ''
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                className={`absolute bottom-0 bg-[#0059FF] ${
                  isContentVariant ? 'inset-x-0' : 'inset-x-0'
                } ${isContentVariant ? 'h-0.5' : 'h-[1.5px]'}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
