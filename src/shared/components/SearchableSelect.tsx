import { useEffect, useMemo, useRef, useState } from 'react';
import searchIcon from '@/assets/icons/search.svg';

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '검색하기',
  fullWidth = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  // 열려있으면 입력 중인 검색어, 닫혀있으면 선택된 항목 표시
  const inputValue = isOpen ? query : selectedLabel;

  // 선택 완료 여부 — 테두리 색과 돋보기 노출을 결정 (시안: 선택 전 회색, 선택 후 파랑)
  const hasValue = value !== '';

  // 공백 무시하고 부분 일치 필터 (예: "경기 고양" → "경기도 고양시")
  const filtered = useMemo(() => {
    const q = query.replace(/\s/g, '');
    if (q === '') return options;
    return options.filter((o) => o.label.replace(/\s/g, '').includes(q));
  }, [query, options]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: Option) => {
    onChange(opt.value);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
      {/* 입력 박스 (시안: h 48px · radius 12px · padding 12px 15px) */}
      <div
        className={`flex h-12 items-center justify-between gap-2 rounded-xl border bg-white px-[15px] transition-colors ${
          hasValue ? 'border-[#0059FF]' : 'border-[#D9D9D9]'
        }`}
      >
        <input
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[16px] font-medium leading-[140%] tracking-[-0.244565px] text-[#262626] outline-none placeholder:font-medium placeholder:text-[#A5A5A5]"
        />

        {/* 값이 선택되기 전에만 돋보기 노출 (선택 후에는 숨김) */}
        {!hasValue && (
          <img src={searchIcon} alt="" aria-hidden="true" className="size-5 shrink-0" />
        )}
      </div>

      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-[14px] text-[#A5A5A5]">검색 결과가 없어요</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className="cursor-pointer px-4 py-3 text-[16px] font-medium leading-[140%] tracking-[-0.244565px] text-[#262626] hover:bg-[#F5F8FF]"
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
