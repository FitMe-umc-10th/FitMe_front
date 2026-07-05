type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const steps = Array.from({ length: total }, (_, index) => index + 1);

  return (
    <div
      className="flex w-full gap-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      {steps.map((step) => (
        <span
          key={step}
          className={`h-1.5 flex-1 rounded-full ${
            step <= current ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}
