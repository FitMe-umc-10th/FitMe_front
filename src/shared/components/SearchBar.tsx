import { useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (keyword: string) => void;
  onFocus?: () => void;
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
    <div className="relative w-full h-[48px]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="w-full h-full rounded-[10px] border border-blue-500 bg-white pt-[10px] pb-[10px] pl-[15px] pr-[45px] outline-none font-['Pretendard'] font-medium text-[14px] leading-[1.4] text-slate-800 placeholder:text-slate-300 placeholder:font-['Pretendard'] placeholder:font-medium placeholder:text-[14px] placeholder:leading-[1.4]"
      />
      {/* 20px x 20px 크기의 피그마 규격 돋보기 아이콘 */}
      <span className="absolute right-[15px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[20px] h-[20px] text-blue-500 pointer-events-none">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[20px] h-[20px]"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
    </div>
  );
}
