import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './app/app';
import { setEventsWorker } from '@example/events';

const worker = new SharedWorker(
  new URL('@example/events-worker', import.meta.url)
);
setEventsWorker(worker);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
