import type { StateSchema } from '../../../../app/store/types/state';

export const getEventsSelector = (state: StateSchema) => state.events?.events || [];

export const getEventsViewSelector = (state: StateSchema) => state.events?.view || 'month';

export const getEventsLoadingSelector = (state: StateSchema) => state.events?.loading ?? false;

export const getSelectedEventSelector = (state: StateSchema) => state.events?.selectedEvent || null;

export const getEventFiltersSelector = (state: StateSchema) => state.events?.filters || {};

export const getEventsDateRangeSelector = (state: StateSchema) => ({
  startDate: state.events?.startDate || null,
  endDate: state.events?.endDate || null,
});

export const getEventsCategorySelector = (state: StateSchema) => state.events?.selectedCategory || null;
