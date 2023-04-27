import { Subject, scan } from 'rxjs';
import {
  EventsStreamDataTypes,
  EventsStreamRequestTypes,
} from './eventsStreamDataTypes';
import { EventItem } from './eventItem';

let worker: SharedWorker | undefined;

const eventItemsSubject = new Subject<EventsStreamDataTypes>();

export function setEventsWorker(workerInstance: SharedWorker) {
  worker = workerInstance;
  worker.port.onmessage = function (evt: MessageEvent<EventsStreamDataTypes>) {
    eventItemsSubject.next(evt.data);
  };
  worker.port.start();
}

export const eventsStream = () =>
  eventItemsSubject.asObservable().pipe(
    scan(
      (acc, msg) => {
        if (msg.type === 'added-event') {
          acc.eventItems.set(msg.item.eventId, msg.item);
        } else if (msg.type === 'updated-event') {
          acc.eventItems.set(msg.item.eventId, msg.item);
        } else if (msg.type === 'removed-event') {
          acc.eventItems.delete(msg.itemId);
        } else if (msg.type === 'all-events') {
          acc.eventItems = new Map(
            msg.list.map((item) => [item.eventId, item])
          );
        }
        return acc;
      },
      {
        eventItems: new Map<string, EventItem>(),
      }
    )
  );

export const requestAllEvents = () => {
  if (worker) {
    const msg: EventsStreamRequestTypes = {
      type: 'get-all-events',
    };
    worker.port.postMessage(msg);
  }
};
