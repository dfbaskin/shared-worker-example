import { EventsManager } from './eventsManager';
import {
  EventsStreamDataTypes,
  EventsStreamRequestTypes,
} from './eventsStreamDataTypes';

const ctx = self as unknown as SharedWorkerGlobalScope;

const allPorts = [] as MessagePort[];

const eventsManager = new EventsManager({
  eventHubEndPoint: 'http://localhost:33033/api/EventsHub',
  allEventsEndPoint: 'http://localhost:33033/api/events',
  eventsDataCallback: (eventsData: EventsStreamDataTypes) => {
    for (const port of allPorts) {
      port.postMessage(eventsData);
    }
  },
});

ctx.onconnect = function (evt) {
  const [port] = evt.ports;
  allPorts.push(port);

  port.onmessage = function (evt: MessageEvent<EventsStreamRequestTypes>) {
    const { data } = evt;
    if (data.type === 'get-all-events') {
      const msg: EventsStreamDataTypes = {
        type: 'all-events',
        list: eventsManager.getEventItems(),
      };
      port.postMessage(msg);
    } else {
      console.log(
        `Received unknown message in worker: ${JSON.stringify(data)}`
      );
    }
  };
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
