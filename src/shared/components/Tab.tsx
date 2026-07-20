type TabItem<T extends string> = {
  label: string;
  value: T;
};

type TabProps<T extends string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
};

export function Tab<T extends string>({ tabs, active, onChange }: TabProps<T>) {
  return (
    <div className="flex border-b border-[#EEF0F3] bg-white">
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative h-11 flex-1 text-[14px] font-semibold transition-colors ${
              isActive ? 'text-[#0059FF]' : 'text-[#A5A5A5]'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#0059FF]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
