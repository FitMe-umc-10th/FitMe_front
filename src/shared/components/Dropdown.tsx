import { useEffect, useRef, useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  align?: 'left' | 'right'; // 메뉴 팝업 정렬 위치 (기본값 'left')
  variant?: 'menu' | 'bottomSheet';
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = '선택',
  fullWidth = false,
  align = 'left',
  variant = 'menu',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);
  const isBottomSheet = variant === 'bottomSheet';

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
            : isBottomSheet
              ? 'flex h-5 w-[85px] items-center gap-0 text-[#262626]'
            : 'flex h-5 items-center gap-1 text-[13px] font-semibold text-[#262626]'
        }
      >
        <span
          className={
            selected
              ? isBottomSheet
                ? 'w-[63px] text-center text-[14px] font-normal leading-[140%] tracking-[-0.244565px]'
                : ''
              : 'text-gray-400'
          }
        >
          {selected?.label ?? placeholder}
        </span>
        {/* 화살표: fullWidth면 ▼ / 아니면 시안 SVG */}
        {fullWidth ? (
          <span className="text-xs">▼</span>
        ) : (
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={isBottomSheet ? 'size-5 shrink-0' : 'h-[5px] w-2'}
          >
            <path
              d={isBottomSheet ? 'M6.5 8L10 11.5L13.5 8' : 'M0.4 0.5L4 4.5L7.6 0.5'}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isBottomSheet ? '1.5' : '0.8'}
            />
          </svg>
        )}
      </button>

      {isOpen && isBottomSheet && (
        <>
          <button
            type="button"
            aria-label="정렬 옵션 닫기"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed bottom-0 left-1/2 z-50 flex h-[182px] w-full max-w-[390px] -translate-x-1/2 flex-col items-start rounded-t-[30px] bg-white px-5 py-4">
            <div className="flex h-[15px] w-full items-start justify-center bg-white pb-[5px] pt-[10px]">
              <div className="h-0 w-7 rounded-full border-t-4 border-[#D9D9D9]" />
            </div>

            <div className="flex h-[55px] w-full items-center bg-white pb-5 pt-[10px]">
              <h2 className="text-[18px] font-semibold leading-[140%] text-[#1E1E1E]">정렬</h2>
            </div>

            <div className="flex w-full flex-col bg-white">
              {options.map((opt) => {
                const isSelected = opt.value === value;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className="flex h-10 w-full items-center justify-between bg-white py-[10px] text-left"
                  >
                    <span
                      className={`text-[14px] leading-[140%] text-[#1E1E1E] ${
                        isSelected ? 'font-semibold tracking-[-0.241437px]' : 'font-medium'
                      }`}
                    >
                      {opt.label}
                    </span>

                    {isSelected && (
                      <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5">
                        <path
                          d="M1.5 7.1L5.4 11L12.5 3"
                          fill="none"
                          stroke="#247BFF"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 목록: fullWidth면 가로 꽉 / 아니면 정렬 디자인 */}
      {isOpen && !isBottomSheet && (
        <ul
          className={
            fullWidth
              ? 'absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg'
              : `absolute ${align === 'right' ? 'right-0' : 'left-0'} z-20 mt-2 w-28 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg`
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
