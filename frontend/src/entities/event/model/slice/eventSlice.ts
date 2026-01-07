import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { CalendarEvent, EventFilters, EventSchema } from '../../types/event';

const initialState: EventSchema = {
  events: [],
  selectedEvent: null,
  view: 'month',
  startDate: null,
  endDate: null,
  filters: {},
  selectedCategory: null,
  loading: false,
};

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    // Set all events
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload;
    },

    // Add single event
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },

    // Update event
    updateEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },

    // Remove event
    removeEvent: (state, action: PayloadAction<number>) => {
      state.events = state.events.filter(e => e.id !== action.payload);
    },

    // Select event
    setSelectedEvent: (state, action: PayloadAction<CalendarEvent | null>) => {
      state.selectedEvent = action.payload;
    },

    // Set calendar view (month/week/day/list)
    setView: (state, action: PayloadAction<'month' | 'week' | 'day' | 'list'>) => {
      state.view = action.payload;
    },

    // Set date range for filtering
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },

    // Set filters
    setFilters: (state, action: PayloadAction<EventFilters>) => {
      state.filters = action.payload;
    },

    // Set selected category
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Clear all filters
    clearFilters: state => {
      state.filters = {};
      state.selectedCategory = null;
      state.startDate = null;
      state.endDate = null;
    },

    // Reset state
    resetEventState: () => initialState,
  },
});

export const { reducer: eventReducer } = eventSlice;

export const {
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
} = eventSlice.actions;

export default eventSlice.reducer;
