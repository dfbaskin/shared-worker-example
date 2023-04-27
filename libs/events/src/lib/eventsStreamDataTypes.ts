import { EventItem } from './eventItem';

export type EventsStreamRequestTypes = {
  type: 'get-all-events';
};

export type EventsStreamDataTypes =
  | {
      type: 'all-events';
      list: EventItem[];
    }
  | {
      type: 'added-event';
      item: EventItem;
    }
  | {
      type: 'updated-event';
      item: EventItem;
    }
  | {
      type: 'removed-event';
      itemId: string;
    };
