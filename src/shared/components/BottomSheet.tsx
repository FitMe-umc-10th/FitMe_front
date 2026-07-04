interface Option {
  label: string;
  value: string;
}

interface BottomSheetProps {
  isOpen: boolean;
  title?: string;
  options: Option[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function BottomSheet({
  isOpen,
  title,
  options,
  onSelect,
  onClose,
}: BottomSheetProps) {
  if (!isOpen) return null; // 닫혀있으면 아예 안 그림

  return (
    // 딤(어두운) 배경 — 누르면 닫힘
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end bg-black/40">
      {/* 시트 본체 — 내부 클릭은 닫힘 막기 */}
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-2xl bg-white p-4">
        {title && <h3 className="mb-3 text-center font-semibold">{title}</h3>}
        <ul className="flex flex-col">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className="w-full py-3 text-left text-gray-700 hover:bg-gray-50"
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
