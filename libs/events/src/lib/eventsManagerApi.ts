import { EventItem } from './eventItem';
import { EventsStreamDataTypes } from './eventsStreamDataTypes';

export interface EventsManagerApi {
  onEventsChanged: (
    callback: (eventsData: EventsStreamDataTypes) => void
  ) => void;
  getAllEvents: () => EventItem[];
}
