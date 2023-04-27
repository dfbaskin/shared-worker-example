import { EventItem } from './eventItem';
import { startEventsManager } from './eventsManager';

const ctx = self as unknown as SharedWorkerGlobalScope;
let isStarted = false;

const allPorts = [] as MessagePort[];

ctx.onconnect = function (evt: MessageEvent<unknown>) {
  const [port] = evt.ports;
  allPorts.push(port);

  port.onmessage = function (evt: MessageEvent<unknown>) {
    const { data } = evt;
    console.log(`Worker message: (${JSON.stringify(data)})`);
  };

  // port.start(); - called implicitly by onmessage setter.

  if (!isStarted) {
    console.log('Starting events stream.');
    startEventsManager({
      eventHubEndPoint: 'http://localhost:33033/api/EventsHub',
      allEventsEndPoint: 'http://localhost:33033/api/events',
      onEventsModified: (items: EventItem[]) => {
        for (const portInstance of allPorts) {
          portInstance.postMessage(items);
        }
      },
    });
    isStarted = true;
  }
};

export {};
