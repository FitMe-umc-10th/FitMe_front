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
        className="flex items-center gap-1 text-sm text-gray-600"
      >
        {selected?.label ?? '선택'}
        <span className="text-xs">▼</span>
      </button>

      {/* 열렸을 때만 목록 표시 */}
      {isOpen && (
        <ul className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value); // 부모에게 선택값 알림
                  setIsOpen(false); // 선택하면 닫기
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50
                  ${opt.value === value ? 'font-bold text-blue-500' : 'text-gray-700'}`}
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
