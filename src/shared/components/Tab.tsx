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
    <div className="flex border-b border-gray-100 bg-white">
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative h-12 flex-1 text-sm font-semibold transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
