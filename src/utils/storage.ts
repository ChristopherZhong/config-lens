const inMemoryStorage = new Map<string, string>();

let isLocalStorageSupported: boolean | null = null;

export function resetStorageSupportCache(): void {
  isLocalStorageSupported = null;
}

export function testLocalStorage(): boolean {
  if (isLocalStorageSupported !== null) {
    return isLocalStorageSupported;
  }
  try {
    if (typeof window === 'undefined') {
      isLocalStorageSupported = false;
      return false;
    }
    if (!('localStorage' in window)) {
      isLocalStorageSupported = false;
      return false;
    }
    const storage = window.localStorage;
    if (!storage) {
      isLocalStorageSupported = false;
      return false;
    }
    const testKey = '__config_lens_storage_test__';
    storage.setItem(testKey, testKey);
    storage.getItem(testKey);
    storage.removeItem(testKey);
    isLocalStorageSupported = true;
    return true;
  } catch {
    isLocalStorageSupported = false;
    return false;
  }
}

export function safeStorageGetItem(key: string): string | null {
  if (!testLocalStorage()) {
    return inMemoryStorage.get(key) ?? null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    isLocalStorageSupported = false;
    return inMemoryStorage.get(key) ?? null;
  }
}

export function safeStorageSetItem(key: string, value: string): void {
  inMemoryStorage.set(key, value);
  if (!testLocalStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    isLocalStorageSupported = false;
  }
}

export function safeStorageRemoveItem(key: string): void {
  inMemoryStorage.delete(key);
  if (!testLocalStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    isLocalStorageSupported = false;
  }
}
