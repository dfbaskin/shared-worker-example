import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import styles from './eventItems.module.scss';

interface EventItem {
  eventId: string;
  name: string;
  description: string;
  lastModifiedUTC: string;
}

export function EventItems() {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [items, setItems] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch('http://localhost:33033/api/events')
      .then((rsp) => {
        if (!rsp.ok) {
          throw new Error(`HTTP error ${rsp.status} ${rsp.statusText}`);
        }
        return rsp.json();
      })
      .then((data) => {
        setItems(data);
        setInitialized(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (initialized) {
      let enabled = false;
      const connection = new signalR.HubConnectionBuilder()
        .configureLogging(signalR.LogLevel.Debug)
        .withUrl('http://localhost:33033/api/EventsHub', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .build();

      connection.on('eventAdded', (item: EventItem) => {
        setItems(addItem(item));
      });
      connection.on('eventUpdated', (item: EventItem) => {
        setItems(updateItem(item));
      });
      connection.on('eventRemoved', (item: EventItem) => {
        setItems(removeItem(item));
      });

      connection
        .start()
        .then(() => {
          enabled = true;
          console.log('SignalR connection started.');
        })
        .catch((err) => {
          console.error(err);
        });

      return () => {
        if (enabled) {
          connection.stop();
        }
      };
    }
  }, [initialized]);

  return (
    <div>
      <div>{items.length} event(s).</div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Description</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.eventId}>
              <td>{item.eventId}</td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.lastModifiedUTC}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function addItem(item: EventItem) {
  return (items: EventItem[]) => {
    return [...items, item];
  };
}

function updateItem(item: EventItem) {
  return (items: EventItem[]) => {
    return items.reduce((list, current) => {
      list.push(current.eventId === item.eventId ? item : current);
      return list;
    }, [] as EventItem[]);
  };
}

function removeItem(item: EventItem) {
  return (items: EventItem[]) => {
    return items.reduce((list, current) => {
      if (current.eventId !== item.eventId) {
        list.push(current);
      }
      return list;
    }, [] as EventItem[]);
  };
}
