import { openDB } from "idb";

import type { EngineSnapshot, StorageProvider } from "@brain-vat/engine-core";

const DB_NAME = "brain-vat";
const STORE_NAME = "engine-states";

async function getDatabase() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    }
  });
}

export function createIndexedDbStorageProvider(): StorageProvider {
  return {
    name: "IndexedDB 存储",
    async restore(namespace: string) {
      if (typeof indexedDB === "undefined") {
        return null;
      }

      const database = await getDatabase();
      const value = await database.get(STORE_NAME, namespace);
      return (value as EngineSnapshot | undefined) ?? null;
    },
    async save(namespace: string, snapshot: EngineSnapshot) {
      if (typeof indexedDB === "undefined") {
        return;
      }

      const database = await getDatabase();
      await database.put(STORE_NAME, snapshot, namespace);
    },
    async clear(namespace: string) {
      if (typeof indexedDB === "undefined") {
        return;
      }

      const database = await getDatabase();
      await database.delete(STORE_NAME, namespace);
    }
  };
}
