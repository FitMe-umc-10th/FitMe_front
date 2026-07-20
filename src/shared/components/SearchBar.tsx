import { useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void; // 입력 즉시 반영 (UI용)
  onSearch?: (keyword: string) => void; // 디바운스된 검색어로 실제 검색 (API용)
  onFocus?: () => void; // 포커스 시 검색 오버레이 열기
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onFocus,
  placeholder = '원하는 장학금, 공모전을 찾아보세요',
}: SearchBarProps) {
  const debouncedValue = useDebounce(value, 500); // 0.5초 지연된 값

  // 디바운스된 값이 바뀔 때만 실제 검색 실행
  useEffect(() => {
    onSearch?.(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="h-12 w-full rounded-[10px] border border-[#0059FF] bg-white pl-4 pr-12 text-[14px] font-medium text-[#262626] outline-none placeholder:text-[#A5A5A5]"
      />
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#0059FF]"
      >
        <path
          d="M8.75 15.8333C12.662 15.8333 15.8333 12.662 15.8333 8.75C15.8333 4.83798 12.662 1.66667 8.75 1.66667C4.83798 1.66667 1.66667 4.83798 1.66667 8.75C1.66667 12.662 4.83798 15.8333 8.75 15.8333Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M18.3333 18.3333L13.75 13.75"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </div>
  );
}
