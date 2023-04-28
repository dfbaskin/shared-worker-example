import { useEffect, useState } from 'react';
import { EventsStreamState, eventsStream } from './eventsStream';
import { tap } from 'rxjs';

export function useEventItems() {
  const [state, setState] = useState<EventsStreamState>({
    eventItems: [],
  });
  useEffect(() => {
    const subscription = eventsStream().pipe(tap(setState)).subscribe();
    return () => subscription.unsubscribe();
  }, []);
  return state;
}
