import { useEffect, useRef, useState } from 'react';

export interface TypingSegment {
  text: string;
  className?: string; // 구간별 색상 등 (예: 강조 파란 글씨)
}

interface TypingTextProps {
  segments: TypingSegment[]; // 색상이 섞인 문장을 구간으로 나눠 전달
  speed?: number; // 글자당 간격(ms)
  className?: string;
  onDone?: () => void; // 타이핑 완료 시 호출 (하위 문구 등장 트리거)
}

/**
 * 글자를 한 글자씩 타이핑하며 커서가 따라가는 텍스트.
 * 구간(segment)별로 스타일을 다르게 줄 수 있어, 일부만 강조색인 문장도 처리한다.
 */
export default function TypingText({
  segments,
  speed = 55,
  className = '',
  onDone,
}: TypingTextProps) {
  const fullText = segments.map((s) => s.text).join('');
  const total = fullText.length;

  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  // 최신 콜백 유지 (부모가 매 렌더 새 함수를 넘겨도 타이머가 흔들리지 않도록)
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // 문장이 바뀌면 처음부터 다시 타이핑
  useEffect(() => {
    doneRef.current = false;
    setCount(0);
  }, [fullText]);

  useEffect(() => {
    if (count >= total) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    const timer = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [count, total, speed]);

  // 지금까지 타이핑된 글자 수만큼 구간을 잘라서 렌더
  let remaining = count;
  const visibleSegments = segments.map((seg) => {
    const take = Math.min(seg.text.length, Math.max(0, remaining));
    remaining -= take;
    return { text: seg.text.slice(0, take), className: seg.className };
  });

  return (
    // 스크린리더에는 완성된 문장을 한 번에 전달
    <span className={`whitespace-pre-line ${className}`} aria-label={fullText}>
      <span aria-hidden="true">
        {visibleSegments.map((seg, i) => (
          <span key={i} className={seg.className}>
            {seg.text}
          </span>
        ))}
        {/* 타이핑 위치를 따라가는 커서 */}
        <span className="animate-cursor-blink ml-[2px] inline-block h-[0.95em] w-[2px] translate-y-[0.12em] bg-[#0059FF] align-baseline" />
      </span>
    </span>
  );
}
