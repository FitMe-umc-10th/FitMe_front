import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  showIndicator?: boolean;
  showProgress?: boolean;
  loop?: boolean;
  spotlight?: boolean;
  storageKey?: string;
  autoPlayInterval?: number;
}

export default function Carousel({
  children,
  showIndicator = false,
  showProgress = false,
  loop = false,
  spotlight = false,
  storageKey,
  autoPlayInterval,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionTimeoutRef = useRef<number | null>(null);
  const activeItemKeyRef = useRef<React.Key | null>(null);
  const childKeysRef = useRef<React.Key[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const childrenArray = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);
  const count = childrenArray.length;
  const childKeys = useMemo(
    () => childrenArray.map((child, index) =>
      React.isValidElement(child) && child.key !== null ? child.key : index,
    ),
    [childrenArray],
  );
  const childKeySignature = childKeys.join('|');
  childKeysRef.current = childKeys;
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
    if (behavior === 'auto') {
      setCurrentIndex(targetIndex);
      activeItemKeyRef.current = childKeysRef.current[targetIndex] ?? null;
    }
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
  }, [count, getStoredIndex, getStoredScrollLeft, loop, scrollToIndex, spotlight]);

  const updateCurrentIndex = useCallback((nextIndex: number) => {
    setCurrentIndex(nextIndex);
    activeItemKeyRef.current = childKeysRef.current[nextIndex] ?? null;

    if (indexStorageKey) {
      window.sessionStorage.setItem(indexStorageKey, String(nextIndex));
    }
  }, [indexStorageKey]);

  useEffect(() => {
    const activeKey = activeItemKeyRef.current;
    if (activeKey === null || count === 0) return;

    const preservedIndex = childKeysRef.current.findIndex((key) => key === activeKey);
    if (preservedIndex < 0 || preservedIndex === currentIndex) return;

    setCurrentIndex(preservedIndex);
    const frameId = window.requestAnimationFrame(() => scrollToIndex(preservedIndex));
    return () => window.cancelAnimationFrame(frameId);
  }, [childKeySignature, count, currentIndex, scrollToIndex]);

  const pauseAutoPlay = () => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    setIsInteracting(true);
  };

  const resumeAutoPlay = () => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
    }, 800);
  };

  const handleWheel = () => {
    pauseAutoPlay();
    resumeAutoPlay();
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, clientWidth } = container;
    if (clientWidth === 0) return;

    if (scrollStorageKey) {
      window.sessionStorage.setItem(scrollStorageKey, String(scrollLeft));
    }

    if (loop && spotlight && count > 1) return;

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
          updateCurrentIndex(count - 1);
        }
      }
      // 복제된 첫 번째 아이템(인덱스 count + 1)에 도달한 경우 -> 실물 첫 번째 아이템(인덱스 1)으로 점프
      else if (closestIndex === count + 1) {
        const realFirstChild = childrenElements[1] as HTMLElement;
        if (realFirstChild) {
          const targetLeft = realFirstChild.offsetLeft + realFirstChild.offsetWidth / 2 - clientWidth / 2;
          container.scrollLeft = targetLeft;
          updateCurrentIndex(0);
        }
      }
      // 일반 아이템이고, 스크롤 정렬 상태가 정중앙에서 살짝 벗어나 있다면 자석처럼 스르륵 정중앙 정렬
      else {
        const targetChild = childrenElements[closestIndex] as HTMLElement;
        if (targetChild) {
          const targetLeft = targetChild.offsetLeft + targetChild.offsetWidth / 2 - clientWidth / 2;
          const currentDiff = Math.abs(scrollLeft - targetLeft);
          if (currentDiff > 2) {
            container.scrollTo({ left: targetLeft, behavior: spotlight ? 'auto' : 'smooth' });
          }
          updateCurrentIndex(closestIndex - 1);
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
  }, [loop, count, spotlight, updateCurrentIndex]);

  useEffect(() => {
    if (!autoPlayInterval || autoPlayInterval <= 0 || count <= 1 || isInteracting) return;

    const intervalId = window.setInterval(() => {
      if (document.hidden) return;

      if (loop && currentIndex === count - 1) {
        const container = containerRef.current;
        const clonedFirstChild = container?.children[count + 1] as HTMLElement | undefined;

        if (container && clonedFirstChild) {
          const targetLeft = clonedFirstChild.offsetLeft + clonedFirstChild.offsetWidth / 2 - container.clientWidth / 2;
          container.scrollTo({ left: targetLeft, behavior: 'smooth' });
          return;
        }
      }

      const nextIndex = currentIndex + 1 >= count ? (loop ? 0 : currentIndex) : currentIndex + 1;
      if (nextIndex === currentIndex) return;

      scrollToIndex(nextIndex, 'smooth');
    }, autoPlayInterval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoPlayInterval, count, currentIndex, isInteracting, loop, scrollToIndex]);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const getRealIndex = (displayIndex: number) => {
    if (!loop || count <= 1) return displayIndex;
    if (displayIndex === 0) return count - 1;
    if (displayIndex === count + 1) return 0;
    return displayIndex - 1;
  };

  // 무한 루프 시 좌우 여백을 두어 인접 카드가 Figma 시안처럼 살짝 보이도록 맞춘다.
  const paddingClass = loop ? `${spotlight ? 'px-0' : 'px-[38px] py-3'}` : 'pb-1';
  const gapClass = spotlight ? 'gap-3' : 'gap-4';
  const wrapperClass = 'w-full';
  const scrollPaddingStyle = loop
    ? {
        scrollPaddingLeft: spotlight ? '0px' : '38px',
        scrollPaddingRight: spotlight ? '0px' : '38px',
      }
    : undefined;

  return (
    <div className={`relative overflow-visible ${wrapperClass}`}>
      {/* 가로 스와이프 스냅 컨테이너 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={pauseAutoPlay}
        onPointerUp={resumeAutoPlay}
        onPointerCancel={resumeAutoPlay}
        onPointerLeave={resumeAutoPlay}
        onWheel={handleWheel}
        className={`flex items-center overflow-x-auto scrollbar-none snap-x snap-mandatory ${gapClass} ${paddingClass}`}
        style={scrollPaddingStyle}
      >
        {displayItems.map((child, index) => {
          const activeDisplayIndex = loop && count > 1 ? currentIndex + 1 : currentIndex;
          const realIndex = getRealIndex(index);
          const isActive = spotlight
            ? index === activeDisplayIndex
            : realIndex === currentIndex;
          // 267.5px 고정 슬롯: (292 - 243) / 2 여백과 12px gap이 상쇄되어
          // 활성 카드와 양옆 카드의 실제 외곽 간격은 항상 12px로 유지된다.
          const spotlightClass = spotlight
            ? `flex h-[239px] w-[267.5px] transform-gpu items-center justify-center ${
                isActive ? 'z-10 opacity-100' : 'z-0 opacity-100'
              }`
            : '';

          return (
            <div
              key={index}
              className={`${loop ? 'snap-center flex-shrink-0' : 'snap-start flex-shrink-0'} ${spotlightClass}`}
            >
              {(showIndicator || spotlight) && React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<{ carouselIndexLabel?: string; carouselActive?: boolean }>, {
                    ...(showIndicator ? { carouselIndexLabel: `${realIndex + 1}/${count}` } : {}),
                    ...(spotlight ? { carouselActive: isActive } : {}),
                  })
                : child}
            </div>
          );
        })}
      </div>

      {/* 일반 캐러셀 인디케이터. spotlight 캐러셀은 각 카드 내부에 번호를 붙인다. */}
      {showIndicator && !spotlight && count > 0 && (
        <div className="pointer-events-none absolute right-[70px] top-9 z-20 flex h-5 w-7 items-center justify-center rounded-full bg-[#A5A5A5] px-[5px] text-[12px] font-medium leading-none text-white select-none">
          {currentIndex + 1}/{count}
        </div>
      )}

      {showProgress && count > 0 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  pauseAutoPlay();
                  scrollToIndex(index, 'smooth');
                  resumeAutoPlay();
                }}
                className={`h-2 shrink-0 rounded-full p-0 transition-all duration-200 ${
                  isActive ? 'w-9 bg-[#A8D2FF]' : 'w-2 bg-[#F0F0F0]'
                }`}
                aria-label={`${index + 1}번째 공고로 이동`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
