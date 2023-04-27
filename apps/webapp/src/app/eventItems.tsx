import { useEventItems } from '@example/events';
import styles from './eventItems.module.scss';

export function EventItems() {
  const { eventItems: items } = useEventItems();
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
