import { useState, useRef, useEffect } from 'react';

interface Option {
  label: string; // 화면에 보이는 글자 (예: "최신순")
  value: string; // 실제 값 (예: "latest")
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; // 선택 전 안내 문구
  fullWidth?: boolean; // true면 가로 꽉 찬 박스 스타일 (온보딩용)
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = '선택',
  fullWidth = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
      {/* 버튼: fullWidth면 온보딩 박스 스타일 / 아니면 정렬 디자인(시안) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          fullWidth
            ? 'flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-left'
            : 'flex h-5 items-center gap-1 text-[13px] font-semibold text-[#262626]'
        }
      >
        <span className={selected ? '' : 'text-gray-400'}>{selected?.label ?? placeholder}</span>
        {/* 화살표: fullWidth면 ▼ / 아니면 시안 SVG */}
        {fullWidth ? (
          <span className="text-xs">▼</span>
        ) : (
          <svg viewBox="0 0 8 5" aria-hidden="true" className="h-[5px] w-2">
            <path
              d="M0.4 0.5L4 4.5L7.6 0.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.8"
            />
          </svg>
        )}
      </button>

      {/* 목록: fullWidth면 가로 꽉 / 아니면 정렬 디자인 */}
      {isOpen && (
        <ul
          className={
            fullWidth
              ? 'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg'
              : 'absolute right-0 z-10 mt-2 w-28 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg'
          }
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={
                  fullWidth
                    ? `w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                        opt.value === value ? 'font-bold text-blue-500' : 'text-gray-700'
                      }`
                    : `w-full px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#F8FAFC] ${
                        opt.value === value ? 'text-[#0059FF]' : 'text-[#595959]'
                      }`
                }
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
