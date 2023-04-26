import { EventsConfig } from './eventConfig';
import { EventItem } from './eventItem';
import * as signalR from '@microsoft/signalr';

let eventMap = new Map<string, EventItem>();
let onEventsModified: (list: EventItem[]) => void = () => {};

export function startEventsManager(config: EventsConfig) {
  onEventsModified = config.onEventsModified;
  const connection = createEventHubConnection(config.eventHubEndPoint);
  let isEnabled = false;
  runEventsManager(config, connection)
    .then(() => {
      console.log('Events manager running.');
      isEnabled = true;
    })
    .catch((err) => {
      console.error('Events manager stopped with error.');
      console.error(err);
    });
  return () => {
    onEventsModified = () => {};
    eventMap = new Map();
    if (isEnabled) {
      connection.stop();
    }
  };
}

function modifiedEvents() {
  onEventsModified([...eventMap.values()]);
}

async function runEventsManager(
  config: EventsConfig,
  connection: signalR.HubConnection
) {
  const flushQueue = addUpdatesToQueue(connection);

  await connection.start();
  console.log('SignalR connection started.');

  await getAllEvents(config.allEventsEndPoint);
  flushQueue();
  console.log('Initial set of events retrieved.');

  modifiedEvents();

  return addUpdatesToMap(connection);
}

function createEventHubConnection(endPoint: string) {
  return new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Debug)
    .withUrl(endPoint, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .build();
}

type QueueItem =
  | {
      added: EventItem;
    }
  | {
      updated: EventItem;
    }
  | {
      removed: EventItem;
    };

function isAddedItem(qi: QueueItem): qi is {
  added: EventItem;
} {
  return qi.hasOwnProperty('added');
}
function isUpdatedItem(qi: QueueItem): qi is {
  updated: EventItem;
} {
  return qi.hasOwnProperty('updated');
}
function isRemovedItem(qi: QueueItem): qi is {
  removed: EventItem;
} {
  return qi.hasOwnProperty('removed');
}

function addUpdatesToQueue(connection: signalR.HubConnection) {
  const queue: QueueItem[] = [];
  const onAdd = (item: EventItem) => {
    queue.push({
      added: item,
    });
  };
  const onUpdate = (item: EventItem) => {
    queue.push({
      updated: item,
    });
  };
  const onRemove = (item: EventItem) => {
    queue.push({
      removed: item,
    });
  };
  connection.on('eventAdded', onAdd);
  connection.on('eventUpdated', onUpdate);
  connection.on('eventRemoved', onRemove);
  return () => {
    for (const qi of queue) {
      if (isAddedItem(qi)) {
        eventMap.set(qi.added.eventId, qi.added);
      } else if (isUpdatedItem(qi)) {
        eventMap.set(qi.updated.eventId, qi.updated);
      } else if (isRemovedItem(qi)) {
        eventMap.delete(qi.removed.eventId);
      }
    }
    connection.off('eventAdded', onAdd);
    connection.off('eventUpdated', onUpdate);
    connection.off('eventRemoved', onRemove);
  };
}

function addUpdatesToMap(connection: signalR.HubConnection) {
  const onAdd = (item: EventItem) => {
    eventMap.set(item.eventId, item);
    modifiedEvents();
  };
  const onUpdate = (item: EventItem) => {
    eventMap.set(item.eventId, item);
    modifiedEvents();
  };
  const onRemove = (item: EventItem) => {
    eventMap.delete(item.eventId);
    modifiedEvents();
  };
  connection.on('eventAdded', onAdd);
  connection.on('eventUpdated', onUpdate);
  connection.on('eventRemoved', onRemove);
  return () => {
    connection.off('eventAdded', onAdd);
    connection.off('eventUpdated', onUpdate);
    connection.off('eventRemoved', onRemove);
  };
}

async function getAllEvents(endPoint: string) {
  const rsp = await fetch(endPoint);
  if (!rsp.ok) {
    throw new Error(`HTTP error ${rsp.status} ${rsp.statusText}`);
  }
  const data: EventItem[] = await rsp.json();
  eventMap = new Map(data.map((item) => [item.eventId, item]));
}
