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
      className={`flex h-[42px] cursor-pointer items-center justify-center whitespace-nowrap rounded-[100px] border px-[15px] text-[16px] font-medium leading-[140%] transition-colors
        ${
          selected
            ? 'border-transparent bg-[#247BFF] text-white' // 선택: 파란 배경 + 흰 글자
            : 'border-[#D9D9D9] bg-white text-[#8C8C8C] hover:bg-[#F5F8FF]' // 미선택: 회색 테두리 + 회색 글자
        }`}
    >
      {label}
    </button>
  );
}
