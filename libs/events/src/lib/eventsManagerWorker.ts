import * as Comlink from 'comlink';
import { EventsManager } from './eventsManager';
import {
  EventsStreamDataTypes,
} from './eventsStreamDataTypes';
import { EventsManagerApi } from './eventsManagerApi';
import { Subject, Subscription, tap } from 'rxjs';

const ctx = self as unknown as SharedWorkerGlobalScope;

const eventsDataStream = new Subject<EventsStreamDataTypes>();

function eventsWorkerServiceApiFactory(): EventsManagerApi {
  let subscription: Subscription | undefined = undefined;
  return {
    onEventsChanged: (
      callback: (eventsData: EventsStreamDataTypes) => void
    ) => {
      if (subscription) {
        subscription.unsubscribe();
      }
      subscription = eventsDataStream
        .asObservable()
        .pipe(
          tap((eventsData) => {
            callback(eventsData);
          })
        )
        .subscribe();
    },
    getAllEvents: () => eventsManager.getEventItems(),
  };
}

const eventsManager = new EventsManager({
  eventHubEndPoint: 'http://localhost:33033/api/EventsHub',
  allEventsEndPoint: 'http://localhost:33033/api/events',
  eventsDataCallback: (eventsData: EventsStreamDataTypes) => {
    eventsDataStream.next(eventsData);
  },
});

ctx.onconnect = function (evt) {
  const [port] = evt.ports;
  const eventsWorkerApi = eventsWorkerServiceApiFactory();
  Comlink.expose(eventsWorkerApi, port);
};

eventsManager
  .open()
  .then(() => {
    console.log('Events manager running.');
  })
  .catch((err) => {
    console.error('Error running events manager.');
    console.error(err);
  });

export {};
