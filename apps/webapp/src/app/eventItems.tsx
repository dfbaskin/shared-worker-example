import { useEventItems, formatDateText, isOlderThanSeconds } from '@example/events';
import styles from './eventItems.module.scss';

export function EventItems() {
  const { eventItems } = useEventItems();
  return (
    <div>
      <div>{eventItems.length} event(s).</div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Description</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {eventItems.map((item) => {
            const dateText = formatDateText(item.lastModifiedUTC);
            const hasRecentUpdate = !isOlderThanSeconds(item.lastModifiedUTC, 1.0);
            const updateClassName = hasRecentUpdate ? styles.recentUpdate : styles.normalRow;
            return (
              <tr key={item.eventId} className={updateClassName}>
                <td>{item.eventId}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{dateText}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}
