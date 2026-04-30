import { openDB, IDBPDatabase } from 'idb';
import { HistoricalEvent } from './types';

const DB_NAME = 'giluy_db';
const STORE_NAME = 'history';

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveEvent(event: HistoricalEvent) {
  const db = await initDB();
  await db.put(STORE_NAME, event);
}

export async function getHistory(): Promise<HistoricalEvent[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearHistory() {
  const db = await initDB();
  await db.clear(STORE_NAME);
}
