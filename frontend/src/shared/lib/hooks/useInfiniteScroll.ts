import { type RefObject, useEffect } from 'react';

export interface IUseInfiniteScroll {
  callback?: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  wrapperRef: RefObject<HTMLElement | null>;
}

export const useInfiniteScroll = ({ callback, triggerRef, wrapperRef }: IUseInfiniteScroll) => {
  //   const observerNode = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!callback || !triggerRef.current) return;

    const wrapperElement = wrapperRef.current;
    const triggerElement = triggerRef.current;

    let observer: IntersectionObserver | null = null;

    const options = {
      root: wrapperElement,
      rootMargin: '0px', // extend scope to100px
      threshold: 0.5, // 50% from elem visibility
    };

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback && callback();
      }
    }, options);

    triggerElement && observer.observe(triggerElement);

    return () => {
      if (observer && triggerElement) {
        triggerElement && observer.unobserve(triggerElement);
      }
    };
  }, [triggerRef, wrapperRef, callback]);
};
