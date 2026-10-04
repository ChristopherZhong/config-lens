import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateContent, fetchSchema, clearCaches } from '../../src/utils/validation';

describe('validation logic', () => {
  beforeEach(() => {
    clearCaches();
    vi.restoreAllMocks();
  });

  it('identifies valid JSON', async () => {
    const json = '{"name": "test"}';
    const result = await validateContent(json, 'json');
    expect(result).toEqual([]);
  });

  it('identifies invalid JSON syntax', async () => {
    const json = '{"name": "test"';
    const result = await validateContent(json, 'json');
    expect(result.length).toBe(1);
    // Error message varies by environment, so we check for common parts or existence
    expect(result[0].message).toBeDefined();
  });

  it('identifies valid YAML', async () => {
    const yaml = 'name: test\nversion: 1.0.0';
    const result = await validateContent(yaml, 'yaml');
    expect(result).toEqual([]);
  });

  it('identifies invalid YAML syntax', async () => {
    const yaml = 'name: test\n  version: 1.0.0\ninvalid: : :';
    const result = await validateContent(yaml, 'yaml');
    expect(result.length).toBe(1);
  });

  it('handles empty input', async () => {
    const result = await validateContent('', 'json');
    expect(result).toEqual([]);
  });

  it('validates against schema if $schema is present and maps diagnostic position', async () => {
    const json = '{"$schema": "http://example.com/schema.json", "age": "not-a-number"}';

    // Mock fetch for schema
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'object',
        properties: {
          age: { type: 'number' }
        }
      })
    }) as any;

    const result = await validateContent(json, 'json');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].message).toContain('Schema: /age must be number');
    // Ensure diagnostic range points directly to the value `"not-a-number"` rather than the entire document
    const errorText = json.slice(result[0].from, result[0].to);
    expect(errorText).toBe('"not-a-number"');
  });

  it('validates string formats such as uri using ajv-formats', async () => {
    const json = '{"$schema": "http://example.com/uri-schema.json", "homepage": "not a url"}';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'object',
        properties: {
          homepage: { type: 'string', format: 'uri' }
        }
      })
    }) as any;

    const result = await validateContent(json, 'json');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].message).toContain('Schema: /homepage must match format "uri"');
  });

  it('deduplicates concurrent in-flight schema fetches', async () => {
    const schemaUrl = 'http://example.com/dedup-schema.json';
    let fetchCount = 0;

    globalThis.fetch = vi.fn().mockImplementation(async () => {
      fetchCount++;
      // Delayed response to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        ok: true,
        json: async () => ({
          type: 'object',
          properties: { name: { type: 'string' } }
        })
      };
    }) as any;

    // Fire 5 concurrent fetches
    const results = await Promise.all([
      fetchSchema(schemaUrl),
      fetchSchema(schemaUrl),
      fetchSchema(schemaUrl),
      fetchSchema(schemaUrl),
      fetchSchema(schemaUrl)
    ]);

    expect(fetchCount).toBe(1);
    expect(results.length).toBe(5);
    expect(results[0]).toEqual({ type: 'object', properties: { name: { type: 'string' } } });
  });

  it('deduplicates concurrent validateContent calls with schema', async () => {
    const json = '{"$schema": "http://example.com/concurrent-schema.json", "name": 123}';
    let fetchCount = 0;

    globalThis.fetch = vi.fn().mockImplementation(async () => {
      fetchCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        ok: true,
        json: async () => ({
          type: 'object',
          properties: { name: { type: 'string' } }
        })
      };
    }) as any;

    const [res1, res2, res3] = await Promise.all([
      validateContent(json, 'json'),
      validateContent(json, 'json'),
      validateContent(json, 'json')
    ]);

    expect(fetchCount).toBe(1);
    expect(res1.length).toBeGreaterThan(0);
    expect(res2.length).toBeGreaterThan(0);
    expect(res3.length).toBeGreaterThan(0);
  });

  it('rejects non-HTTP/HTTPS schema URLs and invalid URL strings safely', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const invalidUrls = [
      'javascript:alert(1)',
      'file:///etc/passwd',
      'ftp://example.com/schema.json',
      'not a url',
      '',
    ];

    for (const url of invalidUrls) {
      const result = await fetchSchema(url);
      expect(result).toBeNull();
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
