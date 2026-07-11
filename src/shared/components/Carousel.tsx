import React, { useCallback, useRef, useState, useEffect } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  showIndicator?: boolean;
  showProgress?: boolean;
  loop?: boolean;
  storageKey?: string;
}

export default function Carousel({
  children,
  showIndicator = false,
  showProgress = false,
  loop = false,
  storageKey,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const count = childrenArray.length;
  const indexStorageKey = storageKey ? `${storageKey}:index` : undefined;
  const scrollStorageKey = storageKey ? `${storageKey}:scrollLeft` : undefined;

  const getStoredIndex = useCallback(() => {
    if (!indexStorageKey) return 0;

    const storedIndex = Number(window.sessionStorage.getItem(indexStorageKey));
    if (!Number.isInteger(storedIndex)) return 0;

    return Math.min(Math.max(storedIndex, 0), Math.max(count - 1, 0));
  }, [count, indexStorageKey]);

  const getStoredScrollLeft = useCallback(() => {
    if (!scrollStorageKey) return null;

    const storedScrollLeft = Number(window.sessionStorage.getItem(scrollStorageKey));
    if (!Number.isFinite(storedScrollLeft)) return null;

    return Math.max(storedScrollLeft, 0);
  }, [scrollStorageKey]);

  const scrollToIndex = useCallback((targetIndex: number, behavior: ScrollBehavior = 'auto') => {
    const container = containerRef.current;
    if (!container) return;

    const childrenElements = container.children;
    const childIndex = loop && count > 1 ? targetIndex + 1 : targetIndex;
    const targetChild = childrenElements[childIndex] as HTMLElement | undefined;
    if (!targetChild) return;

    const targetLeft = loop
      ? targetChild.offsetLeft + targetChild.offsetWidth / 2 - container.clientWidth / 2
      : targetChild.offsetLeft;

    container.scrollTo({ left: targetLeft, behavior });
    setCurrentIndex(targetIndex);
  }, [count, loop]);

  // 무한 루프일 때 자식 배열 구성: [마지막 아이템, ...기본 아이템들, 첫 번째 아이템]
  const displayItems = loop && count > 1
    ? [childrenArray[count - 1], ...childrenArray, childrenArray[0]]
    : childrenArray;

  // 컴포넌트 마운트 및 렌더링 시 초기 스크롤 위치 조정
  useEffect(() => {
    if (count === 0) return;

    const timer = setTimeout(() => {
      const storedScrollLeft = getStoredScrollLeft();

      if (!loop && storedScrollLeft !== null && containerRef.current) {
        containerRef.current.scrollTo({ left: storedScrollLeft, behavior: 'auto' });
        setCurrentIndex(getStoredIndex());
        return;
      }

      scrollToIndex(getStoredIndex());
    }, 50);

    return () => clearTimeout(timer);
  }, [count, getStoredIndex, getStoredScrollLeft, loop, scrollToIndex]);

  const updateCurrentIndex = (nextIndex: number) => {
    setCurrentIndex(nextIndex);

    if (indexStorageKey) {
      window.sessionStorage.setItem(indexStorageKey, String(nextIndex));
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, clientWidth } = container;
    if (clientWidth === 0) return;

    if (scrollStorageKey) {
      window.sessionStorage.setItem(scrollStorageKey, String(scrollLeft));
    }

    const childrenElements = container.children;
    if (childrenElements.length === 0) return;

    // 컨테이너 중앙 좌표 기준 가장 가까운 자식 인덱스 탐색
    const containerCenter = scrollLeft + clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < childrenElements.length; i++) {
      const child = childrenElements[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (loop && count > 1) {
      let realIndex = closestIndex - 1;
      if (realIndex < 0) realIndex = count - 1;
      if (realIndex >= count) realIndex = 0;
      updateCurrentIndex(realIndex);
    } else {
      updateCurrentIndex(Math.min(closestIndex, count - 1));
    }
  };

  // 무한 루프 스크롤 위치 보정 (스크롤이 멈췄을 때 실행 - 디바운스 적용하여 크로스브라우징 완벽 지원)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loop || count <= 1) return;

    let scrollTimeout: ReturnType<typeof window.setTimeout>;

    const handleScrollEnd = () => {
      const { scrollLeft, clientWidth } = container;
      const childrenElements = container.children;
      if (childrenElements.length === 0) return;

      const containerCenter = scrollLeft + clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < childrenElements.length; i++) {
        const child = childrenElements[i] as HTMLElement;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(containerCenter - childCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      // 복제된 마지막 아이템(인덱스 0)에 도달한 경우 -> 실물 마지막 아이템(인덱스 count)으로 점프
      if (closestIndex === 0) {
        const realLastChild = childrenElements[count] as HTMLElement;
        if (realLastChild) {
          const targetLeft = realLastChild.offsetLeft + realLastChild.offsetWidth / 2 - clientWidth / 2;
          container.scrollLeft = targetLeft;
        }
      }
      // 복제된 첫 번째 아이템(인덱스 count + 1)에 도달한 경우 -> 실물 첫 번째 아이템(인덱스 1)으로 점프
      else if (closestIndex === count + 1) {
        const realFirstChild = childrenElements[1] as HTMLElement;
        if (realFirstChild) {
          const targetLeft = realFirstChild.offsetLeft + realFirstChild.offsetWidth / 2 - clientWidth / 2;
          container.scrollLeft = targetLeft;
        }
      }
      // 일반 아이템이고, 스크롤 정렬 상태가 정중앙에서 살짝 벗어나 있다면 자석처럼 스르륵 정중앙 정렬
      else {
        const targetChild = childrenElements[closestIndex] as HTMLElement;
        if (targetChild) {
          const targetLeft = targetChild.offsetLeft + targetChild.offsetWidth / 2 - clientWidth / 2;
          const currentDiff = Math.abs(scrollLeft - targetLeft);
          if (currentDiff > 2) {
            container.scrollTo({ left: targetLeft, behavior: 'smooth' });
          }
        }
      }
    };

    const handleScrollEvent = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150); // 150ms 동안 스크롤 이벤트가 없으면 멈춘 것으로 판단
    };

    container.addEventListener('scroll', handleScrollEvent);

    return () => {
      container.removeEventListener('scroll', handleScrollEvent);
      clearTimeout(scrollTimeout);
    };
  }, [loop, count]);

  // 무한 루프 시 좌우 50px 패딩을 주어 인접 카드가 삐져나오도록 유도하고 중앙 스냅 지정
  const paddingClass = loop ? 'px-[50px] py-3' : 'pb-1';
  const scrollPaddingStyle = loop
    ? { scrollPaddingLeft: '50px', scrollPaddingRight: '50px' }
    : undefined;

  return (
    <div className="relative w-full overflow-visible">
      {/* 가로 스와이프 스냅 컨테이너 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory ${paddingClass}`}
        style={scrollPaddingStyle}
      >
        {displayItems.map((child, index) => (
          <div key={index} className={loop ? 'snap-center flex-shrink-0' : 'snap-start flex-shrink-0'}>
            {child}
          </div>
        ))}
      </div>

      {/* 인디케이터 표시 (showIndicator가 true일 때만 노출, 인기 공고 카드 우측 상단 오버레이 위치로 조율) */}
      {showIndicator && count > 0 && (
        <div className="absolute top-6 right-[70px] bg-black/25 backdrop-blur-sm text-white/90 text-[10px] px-2.5 py-0.5 rounded-full font-bold select-none z-10 pointer-events-none">
          {currentIndex + 1} / {count}
        </div>
      )}

      {showProgress && count > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2" aria-hidden="true">
          {Array.from({ length: count }).map((_, index) => {
            const isActive = index === currentIndex;

            return (
              <span
                key={index}
                className={`h-2 rounded-full transition-all duration-200 ${
                  isActive ? 'w-9 bg-blue-300' : 'w-2 bg-gray-100'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
