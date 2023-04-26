import { EventItem } from './eventItem';

export interface EventsConfig {
  allEventsEndPoint: string;
  eventHubEndPoint: string;
  onEventsModified: (list: EventItem[]) => void;
}
