type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = (current / total) * 100;

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      <div
        className="h-full rounded-full bg-blue-600"
        style={{
          width: `${percent}%`,
          // 푸딩 탄성 — 목표 살짝 넘었다가 되돌아옴
          transition: 'width 600ms cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        }}
      />
    </div>
  );
}
