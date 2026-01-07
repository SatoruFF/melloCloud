export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  color: string;
  category?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  taskId?: number;
  userId: number;
  attendees?: any[];
  task?: any;
  user?: any;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  category?: string;
  search?: string;
}

export interface EventSchema {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  view: 'month' | 'week' | 'day' | 'list'; // calendar view mode
  startDate: string | null;
  endDate: string | null;
  filters: EventFilters;
  selectedCategory: string | null;
  loading: boolean;
}
