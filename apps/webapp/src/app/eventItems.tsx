import { useEffect, useState } from 'react';
import { startEventsManager, EventItem } from "@example/events";
import styles from './eventItems.module.scss';

export function EventItems() {
  const [items, setItems] = useState<EventItem[]>([]);

  useEffect(() => {
    return startEventsManager({
      eventHubEndPoint: "http://localhost:33033/api/EventsHub",
      allEventsEndPoint: "http://localhost:33033/api/events",
      onEventsModified: setItems,
    });
  }, []);

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
