import { EventItems } from "./eventItems";
import { Header } from "./header";

import styles from "./app.module.scss";

export function App() {
  return (
    <div className={styles.container}>
      <Header />
      <EventItems />
    </div>
  );
}
