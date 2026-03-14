import { ApiPaths, rtkApi } from '../../../../shared';
import { generateParams } from '../../../../shared';
import { CalendarEvent } from '../types/event';

export const eventApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // GET all user events
    getEvents: builder.query<CalendarEvent[], void>({
      query: () => ApiPaths.events,
    }),

    // GET events by date range
    getEventsByDateRange: builder.query<CalendarEvent[], { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => {
        const params = generateParams({ startDate, endDate });
        return ApiPaths.eventsRange + params;
      },
    }),

    // SEARCH events
    searchEvents: builder.query<CalendarEvent[], string>({
      query: query => {
        const params = generateParams({ query });
        return ApiPaths.eventsSearch + params;
      },
    }),

    // GET single event
    getEvent: builder.query<CalendarEvent, number | string>({
      query: eventId => ApiPaths.events + '/' + eventId,
    }),

    // CREATE event
    createEvent: builder.mutation<
      CalendarEvent,
      {
        title: string;
        description?: string;
        location?: string;
        color?: string;
        category?: string;
        startDate: string;
        endDate: string;
        allDay?: boolean;
        taskId?: number;
        attendees?: number[];
      }
    >({
      query: body => ({
        url: ApiPaths.events,
        method: 'POST',
        body,
      }),
    }),

    // UPDATE event
    updateEvent: builder.mutation<
      CalendarEvent,
      {
        eventId: number | string;
        title?: string;
        description?: string;
        location?: string;
        color?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        allDay?: boolean;
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `${ApiPaths.events}/${eventId}`,
        method: 'PUT',
        body,
      }),
    }),

    // DELETE event
    deleteEvent: builder.mutation<{ success: boolean }, number | string>({
      query: eventId => ({
        url: `${ApiPaths.events}/${eventId}`,
        method: 'DELETE',
      }),
    }),

    // ADD attendee
    addAttendee: builder.mutation<CalendarEvent, { eventId: number | string; attendeeId: number }>({
      query: ({ eventId, attendeeId }) => ({
        url: `${ApiPaths.events}/${eventId}/attendees`,
        method: 'POST',
        body: { attendeeId },
      }),
    }),

    // REMOVE attendee
    removeAttendee: builder.mutation<CalendarEvent, { eventId: number | string; attendeeUserId: number }>({
      query: ({ eventId, attendeeUserId }) => ({
        url: `${ApiPaths.events}/${eventId}/attendees/${attendeeUserId}`,
        method: 'DELETE',
      }),
    }),

    // UPDATE attendee status (self)
    updateAttendeeStatus: builder.mutation<CalendarEvent, { eventId: number | string; status: string }>({
      query: ({ eventId, status }) => ({
        url: `${ApiPaths.events}/${eventId}/attendees/status`,
        method: 'PUT',
        body: { status },
      }),
    }),
  }),
});

export const {
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
} = eventApi;
