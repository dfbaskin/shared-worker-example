import { useEffect, useState } from 'react';
import { eventsStream, requestAllEvents } from './eventsStream';
import { EventItem } from './eventItem';
import { tap } from 'rxjs';

export function useEventItems() {
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  useEffect(() => {
    const subscription = eventsStream()
      .pipe(
        tap((evts) => {
          setEventItems([...evts.eventItems.values()]);
        })
      )
      .subscribe();
    requestAllEvents();
    return () => subscription.unsubscribe();
  }, []);
  return {
    eventItems,
  };
}
