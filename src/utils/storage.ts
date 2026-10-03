const inMemoryStorage = new Map<string, string>();

export function safeStorageGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return inMemoryStorage.get(key) ?? null;
  }
}

export function safeStorageSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    inMemoryStorage.set(key, value);
  }
}

export function safeStorageRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    inMemoryStorage.delete(key);
  }
}
