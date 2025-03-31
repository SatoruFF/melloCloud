import { useCallback, useRef } from "react";

export const useThrottle = (
	callback: (...args: any[]) => void,
	delay = 300,
) => {
	const throttledRef = useRef(false);
	return useCallback(
		(...args: any[]) => {
			if (!throttledRef.current) {
				callback(...args);
				throttledRef.current = true;

				setTimeout(() => {
					throttledRef.current = false;
				}, delay);
			}
		},
		[callback, delay],
	);
};
