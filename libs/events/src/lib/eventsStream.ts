import * as Comlink from 'comlink';
import { Subject, from, scan, switchMap } from 'rxjs';
import { EventsStreamDataTypes } from './eventsStreamDataTypes';
import { EventItem } from './eventItem';
import { EventsManagerApi } from './eventsManagerApi';

let worker: SharedWorker | undefined;
let workerApi: Comlink.Remote<EventsManagerApi> | undefined;

const eventItemsSubject = new Subject<EventsStreamDataTypes>();

export async function setEventsWorker(workerInstance: SharedWorker) {
  worker = workerInstance;
  workerApi = Comlink.wrap(worker.port);
  worker.port.start();
  await workerApi.onEventsChanged(
    Comlink.proxy((eventsData) => {
      eventItemsSubject.next(eventsData);
    })
  );
}

export const eventsStream = () => {
  return from(workerApi!.getAllEvents()).pipe(
    switchMap((eventItems) => {
      return eventItemsSubject.asObservable().pipe(
        scan(
          (acc, msg) => {
            if (msg.type === 'added-event') {
              acc.eventItems.set(msg.item.eventId, msg.item);
            } else if (msg.type === 'updated-event') {
              acc.eventItems.set(msg.item.eventId, msg.item);
            } else if (msg.type === 'removed-event') {
              acc.eventItems.delete(msg.itemId);
            }
            return acc;
          },
          {
            eventItems: new Map<string, EventItem>(
              eventItems.map((item) => [item.eventId, item])
            ),
          }
        )
      );
    })
  );
};

export const requestAllEvents = async () => {
  return await workerApi!.getAllEvents();
};
