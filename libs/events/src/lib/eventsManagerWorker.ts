import { EventItem } from './eventItem';
import { startEventsManager } from './eventsManager';

function onEventsModified(items: EventItem[]) {
  self.postMessage(items);
}

self.onmessage = function (evt: MessageEvent<unknown>) {
  const { data } = evt;
  console.log(`Worker message: (${JSON.stringify(data)})`);
  if (data && typeof data === 'object' && data.hasOwnProperty('start')) {
    console.log('Starting events stream.');
    startEventsManager({
      eventHubEndPoint: 'http://localhost:33033/api/EventsHub',
      allEventsEndPoint: 'http://localhost:33033/api/events',
      onEventsModified,
    });
  }
};

export {};
