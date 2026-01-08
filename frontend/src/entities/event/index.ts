import {
  getEventsSelector,
  getEventsViewSelector,
  getEventsLoadingSelector,
  getSelectedEventSelector,
  getEventFiltersSelector,
  getEventsDateRangeSelector,
  getEventsCategorySelector,
} from './model/selectors/getEvents';

import {
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  setSelectedEvent,
  setView,
  setDateRange,
  setFilters,
  setSelectedCategory,
  setLoading,
  clearFilters,
  resetEventState,
  eventReducer,
} from './model/slice/eventSlice';

import type { CalendarEvent, EventFilters, EventSchema } from './types/event';

import {
  useGetEventsQuery,
  useGetEventsByDateRangeQuery,
  useSearchEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddAttendeeMutation,
  useRemoveAttendeeMutation,
  useUpdateAttendeeStatusMutation,
} from './model/api/eventApi';

export {
  eventReducer,
  // Types
  type CalendarEvent,
  type EventFilters,
  type EventSchema,
  // Selectors
  getEventsSelector,
  getEventsViewSelector,
  getEventsLoadingSelector,
  getSelectedEventSelector,
  getEventFiltersSelector,
  getEventsDateRangeSelector,
  getEventsCategorySelector,
  // Actions
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  setSelectedEvent,
  setView,
  setDateRange,
  setFilters,
  setSelectedCategory,
  setLoading,
  clearFilters,
  resetEventState,
  // API Hooks
  useGetEventsQuery,
  useGetEventsByDateRangeQuery,
  useSearchEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddAttendeeMutation,
  useRemoveAttendeeMutation,
  useUpdateAttendeeStatusMutation,
};
