/** Ключи фич, управляемых из админки. Глобально: isEnabled; для юзера: UserFeatureFlag.isEnabled. */
export interface FeatureFlags {
	files?: boolean;
	notes?: boolean;
	chats?: boolean;
	planner?: boolean;
	kanban?: boolean;
	webhooks?: boolean;
}
