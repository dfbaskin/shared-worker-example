import { ReplaySubject } from 'rxjs';
import { EventItem } from './eventItem';

export const eventItemsSubject = new ReplaySubject<EventItem[]>(1);
eventItemsSubject.next([]);

export function setEventsWorker(worker: Worker) {
  console.log("Initializing events worker.");
  worker.onmessage = function (evt: MessageEvent<EventItem[]>) {
    eventItemsSubject.next(evt.data);
  };
  worker.postMessage({
    start: true,
  });
}

export const eventsStream = eventItemsSubject.asObservable();
