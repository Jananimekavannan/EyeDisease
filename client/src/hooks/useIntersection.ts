import { useEffect, useState, useRef } from 'react';
import type { RefObject } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersection<T extends HTMLElement>(
  options: IntersectionOptions = {}
): [RefObject<T | null>, boolean] {
  const { triggerOnce = true, threshold = 0.1, root = null, rootMargin = '0px' } = options;
  const elementRef = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = elementRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [elementRef, isVisible];
}
