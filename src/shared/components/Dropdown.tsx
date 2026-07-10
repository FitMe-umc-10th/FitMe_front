import { useState, useRef, useEffect } from 'react';

interface Option {
  label: string; // 화면에 보이는 글자 (예: "최신순")
  value: string; // 실제 값 (예: "latest")
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function Dropdown({ options, value, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 현재 선택된 옵션 찾기
  const selected = options.find((opt) => opt.value === value);

  // 드롭다운 바깥을 클릭하면 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside); // 정리
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* 현재 선택값 보여주는 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-[2px] h-[17px] outline-none text-slate-800 cursor-pointer"
      >
        <span className="font-['Pretendard'] font-semibold text-[12px] leading-[1.4] tracking-[-0.24px] text-center">
          {selected?.label ?? '선택'}
        </span>
        {/* 피그마 규격 16x16px 화살표 아이콘 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-[16px] h-[16px] text-slate-800 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 열렸을 때만 목록 표시 */}
      {isOpen && (
        <ul className="absolute left-0 z-30 mt-1.5 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg font-['Pretendard']">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value); // 부모에게 선택값 알림
                  setIsOpen(false); // 선택하면 닫기
                }}
                className={`w-full px-4 py-2 text-left text-[12px] font-semibold hover:bg-slate-50 cursor-pointer
                  ${opt.value === value ? 'text-blue-500' : 'text-slate-700'}`}
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
