import { type RefObject, useCallback, useRef } from "react";

export const useDebounce = (
	callback: (...args: any[]) => void,
	delay = 300,
) => {
	const timer = useRef(null) as RefObject<any>;
	return useCallback(
		(...args: any[]) => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
			timer.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay],
	);
};
