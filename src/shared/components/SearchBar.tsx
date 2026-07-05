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
        className="w-full rounded-full border border-gray-300 py-2.5 pl-4 pr-10 outline-none focus:border-blue-500"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
    </div>
  );
}
