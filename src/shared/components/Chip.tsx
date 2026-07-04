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
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
        ${selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
      {label}
    </button>
  );
}
