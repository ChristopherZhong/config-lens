const inMemoryStorage = new Map<string, string>();

function getLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function safeStorageGetItem(key: string): string | null {
  try {
    const storage = getLocalStorage();
    if (storage) {
      return storage.getItem(key);
    }
  } catch (e) {
    // Fallback to in-memory storage
  }
  return inMemoryStorage.get(key) ?? null;
}

export function safeStorageSetItem(key: string, value: string): void {
  try {
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }
  } catch (e) {
    // Fallback to in-memory storage
  }
  inMemoryStorage.set(key, value);
}

export function safeStorageRemoveItem(key: string): void {
  try {
    const storage = getLocalStorage();
    if (storage) {
      storage.removeItem(key);
      return;
    }
  } catch (e) {
    // Fallback to in-memory storage
  }
  inMemoryStorage.delete(key);
}
