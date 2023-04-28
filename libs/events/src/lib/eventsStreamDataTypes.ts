import { EventItem } from './eventItem';

export type EventsStreamDataTypes =
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
