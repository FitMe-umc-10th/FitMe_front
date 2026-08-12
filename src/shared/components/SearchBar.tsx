import { type FormEvent, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void; // 입력 즉시 반영 (UI용)
  onSearch?: (keyword: string) => void; // 디바운스된 검색어로 실제 검색 (API용)
  onSubmit?: (keyword: string) => void;
  onFocus?: () => void; // 포커스 시 검색 오버레이 열기
  autoFocus?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onSubmit,
  onFocus,
  autoFocus = false,
  placeholder = '원하는 장학금, 공모전을 찾아보세요',
}: SearchBarProps) {
  const debouncedValue = useDebounce(value, 500); // 0.5초 지연된 값

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    } else if (onSearch) {
      onSearch(value);
    }
  };

  // onSearch가 명시적으로 전달된 경우에만 디바운스 검색 실행 (엔터 키 검색일 땐 onSubmit 사용)
  useEffect(() => {
    if (onSearch && debouncedValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  return (
    <form className="relative w-full" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-[#0059FF] bg-white pl-[15px] pr-12 text-[16px] font-medium leading-[140%] text-[#262626] outline-none placeholder:text-[#AFAFAF]"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-4 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-[#0059FF]"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
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
      </button>
    </form>
  );
}
