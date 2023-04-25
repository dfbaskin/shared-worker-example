import { useEffect, useState } from 'react';
import styles from "./eventItems.module.scss";

interface EventItem {
  eventId: string;
  name: string;
  description: string;
  lastModifiedUTC: string;
}

export function EventItems() {
  const [items, setItems] = useState<EventItem[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      fetch('/api/events')
        .then((rsp) => {
          if (!rsp.ok) {
            throw new Error(`HTTP error ${rsp.status} ${rsp.statusText}`);
          }
          return rsp.json();
        })
        .then((data) => {
          setItems(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
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
  );
}
