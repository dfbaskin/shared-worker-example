import { EventsStreamDataTypes } from './eventsStreamDataTypes';

export interface EventsConfig {
  allEventsEndPoint: string;
  eventHubEndPoint: string;
  eventsDataCallback: (eventsData: EventsStreamDataTypes) => void;
}
