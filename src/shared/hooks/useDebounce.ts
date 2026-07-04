import { useState, useEffect } from 'react';

// value가 바뀌어도 delay(ms) 동안 조용하면 그때서야 값을 반영
export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // value가 또 바뀌면 이전 타이머 취소
  }, [value, delay]);

  return debounced;
}
