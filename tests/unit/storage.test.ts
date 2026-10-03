import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeStorageGetItem, safeStorageSetItem, safeStorageRemoveItem } from '../../src/utils/storage';

describe('storage utility', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
  });

  it('gets and sets item from localStorage when available', () => {
    safeStorageSetItem('test-key', 'hello');
    expect(safeStorageGetItem('test-key')).toBe('hello');
    safeStorageRemoveItem('test-key');
    expect(safeStorageGetItem('test-key')).toBeNull();
  });

  it('falls back to in-memory storage when localStorage throws', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    expect(() => safeStorageSetItem('fallback-key', 'secret')).not.toThrow();
    expect(safeStorageGetItem('fallback-key')).toBe('secret');
    expect(() => safeStorageRemoveItem('fallback-key')).not.toThrow();
    expect(safeStorageGetItem('fallback-key')).toBeNull();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });
});
