import type { ReactElement } from "react";
import type { FeatureFlags } from "../../../types/featureFlags";
import { getFeatureFlag } from "../setGetFeatures";

interface ToggleFeaturesProps {
	feature: keyof FeatureFlags;
	on: ReactElement;
	off: ReactElement;
}

export const ToggleFeatures = (props: ToggleFeaturesProps) => {
	const { on, off, feature } = props;

	if (getFeatureFlag(feature)) {
		return on;
	}

	return off;
};
