import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  safeStorageGetItem,
  safeStorageSetItem,
  safeStorageRemoveItem,
  testLocalStorage,
  resetStorageSupportCache
} from '../../src/utils/storage';

describe('storage utility', () => {
  beforeEach(() => {
    resetStorageSupportCache();
    try {
      localStorage.clear();
    } catch {
      // Ignore if localStorage is mocked or restricted
    }
  });

  it('gets and sets item from localStorage when available', () => {
    expect(testLocalStorage()).toBe(true);
    safeStorageSetItem('test-key', 'hello');
    expect(safeStorageGetItem('test-key')).toBe('hello');
    safeStorageRemoveItem('test-key');
    expect(safeStorageGetItem('test-key')).toBeNull();
  });

  it('falls back to in-memory storage when localStorage throws', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Access to storage is not allowed from this context.');
    });

    expect(testLocalStorage()).toBe(false);

    expect(() => safeStorageSetItem('fallback-key', 'secret')).not.toThrow();
    expect(safeStorageGetItem('fallback-key')).toBe('secret');
    expect(() => safeStorageRemoveItem('fallback-key')).not.toThrow();
    expect(safeStorageGetItem('fallback-key')).toBeNull();

    setItemSpy.mockRestore();
  });

  it('handles SecurityError on property access or getItem gracefully', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access to storage is not allowed from this context.', 'SecurityError');
    });

    safeStorageSetItem('key2', 'val2');
    expect(safeStorageGetItem('key2')).toBe('val2');

    getItemSpy.mockRestore();
  });
});
