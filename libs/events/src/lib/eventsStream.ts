import { ReplaySubject } from 'rxjs';
import { EventItem } from './eventItem';

export const eventItemsSubject = new ReplaySubject<EventItem[]>(1);
eventItemsSubject.next([]);

export function setEventsWorker(worker: SharedWorker) {
  console.log("Initializing events worker.");
  worker.port.onmessage = function (evt: MessageEvent<EventItem[]>) {
    eventItemsSubject.next(evt.data);
  };
  worker.port.start();
}

export const eventsStream = eventItemsSubject.asObservable();
