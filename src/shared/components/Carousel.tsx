import React, { useRef, useState, useEffect } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  showIndicator?: boolean;
}

export default function Carousel({ children, showIndicator = false }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setTotalItems(React.Children.count(children));
  }, [children]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth === 0) return;

    const firstChild = containerRef.current.firstElementChild as HTMLElement;
    if (!firstChild) return;

    const itemWidth = firstChild.offsetWidth;
    const index = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* 가로 스와이프 스냅 컨테이너 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
      >
        {React.Children.map(children, (child) => {
          if (!child) return null;
          return <div className="snap-start flex-shrink-0">{child}</div>;
        })}
      </div>

      {/* 인디케이터 표시 (showIndicator가 true일 때만 노출) */}
      {showIndicator && totalItems > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold select-none z-10">
          {currentIndex + 1} / {totalItems}
        </div>
      )}
    </div>
  );
}
