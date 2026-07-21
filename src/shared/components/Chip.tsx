interface ChipProps {
  label: string;
  selected: boolean; // 선택됐는지 (상태는 부모가 들고 있음)
  onToggle: () => void; // 클릭하면 부모가 선택/해제 처리
}

export default function Chip({ label, selected, onToggle }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`h-[32px] min-w-[60px] rounded-[100px] pt-[6px] pb-[6px] pl-[11.5px] pr-[11.5px] text-[12px] font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center
        ${
          selected
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
    >
      {label}
    </button>
  );
}
