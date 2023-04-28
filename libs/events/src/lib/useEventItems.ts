import { useEffect, useState } from 'react';
import { eventsStream, requestAllEvents } from './eventsStream';
import { EventItem } from './eventItem';
import { from, switchMap, tap } from 'rxjs';

export function useEventItems() {
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  useEffect(() => {
    const subscription = from(requestAllEvents())
      .pipe(
        tap(setEventItems),
        switchMap(() =>
          eventsStream().pipe(
            tap((evts) => {
              setEventItems([...evts.eventItems.values()]);
            })
          )
        )
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }, []);
  return {
    eventItems,
  };
}
