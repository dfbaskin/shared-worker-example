import { EventsConfig } from './eventConfig';
import { EventItem } from './eventItem';
import * as signalR from '@microsoft/signalr';
import { EventsStreamDataTypes } from './eventsStreamDataTypes';

interface MethodHandlers {
  eventAdded: (item: EventItem) => void;
  eventUpdated: (item: EventItem) => void;
  eventRemoved: (item: EventItem) => void;
}

export class EventsManager {
  private enabled: boolean = false;
  private connection?: signalR.HubConnection;
  private methodHandlers?: MethodHandlers;
  private eventItems: Map<string, EventItem> = new Map();

  constructor(private config: EventsConfig) {}

  async open() {
    this.connection = this.createEventHubConnection();

    const queue = this.queuedMethodHandlers();
    this.setMethodHandlers(queue.handlers);

    await this.connection.start();

    const list = await this.getAllEvents();
    this.eventItems = new Map(list.map((item) => [item.eventId, item]));
    this.config.eventsDataCallback({
      type: 'all-events',
      list: this.getEventItems(),
    });

    queue.flushQueue();
    this.removeMethodHandlers();

    const callbacks = this.callbackMethodHandlers();
    this.setMethodHandlers(callbacks.handlers);
    this.enabled = true;
  }

  async close() {
    if (this.enabled && this.connection) {
      this.removeMethodHandlers();
      this.enabled = false;
      this.eventItems.clear();
      await this.connection.stop();
      this.connection = undefined;
    }
  }

  getEventItems() {
    return [...this.eventItems.values()];
  }

  private createEventHubConnection() {
    return new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug)
      .withUrl(this.config.eventHubEndPoint, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();
  }

  private setMethodHandlers(handlers: MethodHandlers) {
    if (this.connection) {
      this.methodHandlers = handlers;
      for (const [methodName, callback] of Object.entries(
        this.methodHandlers
      )) {
        this.connection.on(methodName, callback);
      }
    }
  }

  private removeMethodHandlers() {
    if (this.connection && this.methodHandlers) {
      for (const [methodName, callback] of Object.entries(
        this.methodHandlers
      )) {
        this.connection.off(methodName, callback);
      }
      this.methodHandlers = undefined;
    }
  }

  private queuedMethodHandlers() {
    const queuedMessages: EventsStreamDataTypes[] = [];
    const eventAdded = (item: EventItem) => {
      queuedMessages.push({
        type: 'added-event',
        item,
      });
    };
    const eventUpdated = (item: EventItem) => {
      queuedMessages.push({
        type: 'updated-event',
        item,
      });
    };
    const eventRemoved = (item: EventItem) => {
      queuedMessages.push({
        type: 'removed-event',
        itemId: item.eventId,
      });
    };
    const flushQueue = () => {
      for (const msg of queuedMessages) {
        if (msg.type === 'added-event') {
          this.eventItems.set(msg.item.eventId, msg.item);
        } else if (msg.type === 'updated-event') {
          this.eventItems.set(msg.item.eventId, msg.item);
        } else if (msg.type === 'removed-event') {
          this.eventItems.delete(msg.itemId);
        }
        this.config.eventsDataCallback(msg);
      }
    };
    return {
      flushQueue,
      handlers: {
        eventAdded,
        eventUpdated,
        eventRemoved,
      },
    };
  }

  private callbackMethodHandlers() {
    const eventAdded = (item: EventItem) => {
      this.eventItems.set(item.eventId, item);
      this.config.eventsDataCallback({
        type: 'added-event',
        item,
      });
    };
    const eventUpdated = (item: EventItem) => {
      this.eventItems.set(item.eventId, item);
      this.config.eventsDataCallback({
        type: 'updated-event',
        item,
      });
    };
    const eventRemoved = (item: EventItem) => {
      this.eventItems.delete(item.eventId);
      this.config.eventsDataCallback({
        type: 'removed-event',
        itemId: item.eventId,
      });
    };
    return {
      handlers: {
        eventAdded,
        eventUpdated,
        eventRemoved,
      },
    };
  }

  private async getAllEvents() {
    const rsp = await fetch(this.config.allEventsEndPoint);
    if (!rsp.ok) {
      throw new Error(`HTTP error ${rsp.status} ${rsp.statusText}`);
    }
    const data: EventItem[] = await rsp.json();
    return data;
  }
}
