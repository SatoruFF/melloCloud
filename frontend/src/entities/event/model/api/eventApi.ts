import _ from 'lodash-es';
import { rtkApi } from '../../../../shared/api/rtkApi';
import { addQueryParams } from '../../../../shared/lib/url/addQueryParams/addQueryParams';
import { generateParams } from '../../../../shared/lib/url/generateParams/generateParams';
import { queryParamsSync } from '../../../../shared/consts/queryParamsSync';

export const eventApi = rtkApi.injectEndpoints({
  endpoints: builder => ({
    // GET all user events
    getEvents: builder.query<any, void>({
      query: () => 'events',
    }),

    // GET events by date range
    getEventsByDateRange: builder.query<any, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => {
        const params = generateParams({ startDate, endDate });
        return `events/range${params}`;
      },
    }),

    // SEARCH events
    searchEvents: builder.query<any, string>({
      query: query => {
        const params = generateParams({ query });
        return `events/search${params}`;
      },
    }),

    // GET single event
    getEvent: builder.query<any, number | string>({
      query: eventId => `events/${eventId}`,
    }),

    // CREATE event
    createEvent: builder.mutation<
      any,
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
        url: 'events',
        method: 'POST',
        body,
      }),
    }),

    // UPDATE event
    updateEvent: builder.mutation<
      any,
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
        url: `events/${eventId}`,
        method: 'PUT',
        body,
      }),
    }),

    // DELETE event
    deleteEvent: builder.mutation<any, number | string>({
      query: eventId => ({
        url: `events/${eventId}`,
        method: 'DELETE',
      }),
    }),

    // ADD attendee
    addAttendee: builder.mutation<any, { eventId: number | string; attendeeId: number }>({
      query: ({ eventId, attendeeId }) => ({
        url: `events/${eventId}/attendees`,
        method: 'POST',
        body: { attendeeId },
      }),
    }),

    // REMOVE attendee
    removeAttendee: builder.mutation<any, { eventId: number | string; attendeeUserId: number }>({
      query: ({ eventId, attendeeUserId }) => ({
        url: `events/${eventId}/attendees/${attendeeUserId}`,
        method: 'DELETE',
      }),
    }),

    // UPDATE attendee status (self)
    updateAttendeeStatus: builder.mutation<any, { eventId: number | string; status: string }>({
      query: ({ eventId, status }) => ({
        url: `events/${eventId}/attendees/status`,
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
