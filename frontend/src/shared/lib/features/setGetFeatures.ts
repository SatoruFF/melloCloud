import type { FeatureFlags } from "../../types/featureFlags";

let featureFlags: FeatureFlags = {};

export function setFeatureFlags(newFeatureFlags?: FeatureFlags) {
	if (newFeatureFlags) {
		featureFlags = newFeatureFlags;
	}
}

/** Если флаг не задан в БД — считаем фичу включённой (обратная совместимость). */
export function getFeatureFlag(flag: keyof FeatureFlags): boolean {
	return featureFlags[flag] ?? true;
}
