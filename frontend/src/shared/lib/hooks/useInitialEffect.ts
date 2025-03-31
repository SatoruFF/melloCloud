import { useEffect } from "react";

const __PROJECT__ = "main"; // FIXME

export function useInitialEffect(callback: () => void) {
	useEffect(() => {
		// @ts-ignore
		if (__PROJECT__ !== "storybook") {
			callback();
		}
		// eslint-disable-next-line
	}, []);
}
