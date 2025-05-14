import cn from "classnames";
import { type ReactNode, type RefObject, type UIEvent, memo, useRef } from "react";

import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import type { StateSchema } from "../../../app/store/types/state";
import { getScrollByPath, restoreScrollActions } from "../../../features/restoreScroll";
import { useInfiniteScroll } from "../../lib/hooks/useInfiniteScroll";
import { useInitialEffect } from "../../lib/hooks/useInitialEffect";
import { useThrottle } from "../../lib/hooks/useThrottle";
import styles from "./page.module.scss";

interface IPage {
  children: ReactNode;
  className?: string;
  onScrollEnd?: () => void;
}

/**
 * ObservablePage component that wraps its children in a scrollable section.
 * It saves the scroll position for each path and restores it on re-render.
 * It also supports infinite scrolling by triggering a callback when the user scrolls to the end.
 */
const ObservablePage = ({ children, onScrollEnd, className }: IPage) => {
  const wrapperRef = useRef(null) as RefObject<HTMLDivElement | null>;
  const triggerRef = useRef(null) as RefObject<HTMLDivElement | null>;
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const scrollPosition = useAppSelector((state: StateSchema) => getScrollByPath(state, pathname));

  useInfiniteScroll({
    wrapperRef,
    triggerRef,
    callback: onScrollEnd,
  });

  useInitialEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = scrollPosition;
    }
  });

  const onScrollHandler = useThrottle((e: UIEvent<HTMLDivElement>) => {
    dispatch(
      restoreScrollActions.setScrollPosition({
        position: e.currentTarget.scrollTop || 0,
        path: pathname,
      })
    );
  }, 500);

  return (
    <section ref={wrapperRef} className={cn(styles.page, className)} onScroll={onScrollHandler}>
      {children}
      {onScrollEnd && <div className={cn(styles.trigger)} ref={triggerRef} />}
    </section>
  );
};

export default memo(ObservablePage); // TODO: btw memo in here perhabs not needed, cause we have children component
