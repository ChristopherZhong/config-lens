import { describe, it, expect, vi } from 'vitest';
import { Text } from '@codemirror/state';
import {
  resolveSchemaRef,
  dereferenceSchema,
  getSchemaForPath,
  createHoverTooltipElement,
  documentParserRegistry,
  getSchemaUrlForDoc
} from './schema-hover';

describe('schema-hover', () => {
  const sampleSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Server Configuration',
    type: 'object',
    required: ['server'],
    properties: {
      server: {
        $ref: '#/$defs/ServerConfig'
      }
    },
    $defs: {
      ServerConfig: {
        type: 'object',
        required: ['port'],
        properties: {
          port: {
            type: 'integer',
            title: 'Server Port',
            description: 'Port number for HTTP server',
            default: 8080,
            minimum: 1,
            maximum: 65535
          },
          protocol: {
            type: 'string',
            enum: ['http', 'https'],
            default: 'http'
          }
        }
      }
    }
  };

  it('extracts schema URL via DocumentParserRegistry for JSON and YAML', () => {
    const jsonDoc = '{"$schema": "https://example.com/json.json"}';
    const yamlDoc = '$schema: https://example.com/yaml.json\nfoo: bar';

    expect(documentParserRegistry.extractSchemaUrl('json', jsonDoc)).toBe('https://example.com/json.json');
    expect(documentParserRegistry.extractSchemaUrl('yaml', yamlDoc)).toBe('https://example.com/yaml.json');
  });

  it('warns and ignores duplicate strategy registrations in DocumentParserRegistry', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    documentParserRegistry.register({
      mode: 'json',
      extractSchemaUrl: () => 'https://override.com/schema.json'
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Strategy for mode 'json' is already registered")
    );
    // Ensure original strategy remains registered
    expect(documentParserRegistry.extractSchemaUrl('json', '{"$schema": "https://original.com"}')).toBe('https://original.com');

    consoleSpy.mockRestore();
  });

  it('resolves $ref pointer in schema', () => {
    const resolved = resolveSchemaRef(sampleSchema, '#/$defs/ServerConfig');
    expect(resolved).toBeDefined();
    expect(resolved?.type).toBe('object');
    const props = resolved?.properties as Record<string, unknown>;
    expect(props?.port).toBeDefined();
  });

  it('dereferences schema correctly and returns original reference on fast path when $ref is absent', () => {
    const subSchemaWithRef = { $ref: '#/$defs/ServerConfig' };
    const derefed = dereferenceSchema(sampleSchema, subSchemaWithRef);
    expect(derefed?.type).toBe('object');
    const props = derefed?.properties as Record<string, Record<string, unknown>>;
    expect(props?.port?.type).toBe('integer');

    // Fast path: when $ref is absent, returns same object reference without cloning
    const subSchemaWithoutRef = { type: 'string', title: 'Name' };
    const derefedFast = dereferenceSchema(sampleSchema, subSchemaWithoutRef);
    expect(derefedFast).toBe(subSchemaWithoutRef);
  });

  it('navigates composition schema keywords (allOf/oneOf/anyOf) in getSchemaForPath', () => {
    const compositionSchema = {
      type: 'object',
      properties: {
        item: {
          oneOf: [
            { properties: { typeA: { type: 'string' } } },
            { properties: { typeB: { type: 'number' } } }
          ]
        }
      }
    };

    const infoA = getSchemaForPath(compositionSchema, ['item', 'typeA']);
    expect(infoA?.propertyName).toBe('typeA');
    expect(infoA?.schema.type).toBe('string');
  });

  it('navigates schema for nested path /server/port', () => {
    const info = getSchemaForPath(sampleSchema, ['server', 'port']);
    expect(info).not.toBeNull();
    expect(info?.propertyName).toBe('port');
    expect(info?.isRequired).toBe(true);
    expect(info?.schema.type).toBe('integer');
    expect(info?.schema.description).toBe('Port number for HTTP server');
    expect(info?.schema.default).toBe(8080);
    expect(info?.schema.minimum).toBe(1);
  });

  it('navigates schema for enum property /server/protocol', () => {
    const info = getSchemaForPath(sampleSchema, ['server', 'protocol']);
    expect(info).not.toBeNull();
    expect(info?.propertyName).toBe('protocol');
    expect(info?.isRequired).toBe(false);
    expect(info?.schema.enum).toEqual(['http', 'https']);
  });

  it('creates DOM tooltip element with schema metadata', () => {
    const info = getSchemaForPath(sampleSchema, ['server', 'port']);
    expect(info).not.toBeNull();
    const dom = createHoverTooltipElement(info!);

    expect(dom).toBeDefined();
    expect(dom.textContent).toContain('port');
    expect(dom.textContent).toContain('integer');
    expect(dom.textContent).toContain('Required');
    expect(dom.textContent).toContain('Port number for HTTP server');
    expect(dom.textContent).toContain('Default: 8080');
    expect(dom.textContent).toContain('min: 1');
  });

  it('prevents prototype traversal in resolveSchemaRef', () => {
    expect(resolveSchemaRef(sampleSchema, '#/__proto__')).toBeNull();
    expect(resolveSchemaRef(sampleSchema, '#/constructor')).toBeNull();
    expect(resolveSchemaRef(sampleSchema, '#/prototype')).toBeNull();
    expect(resolveSchemaRef(sampleSchema, '#/toString')).toBeNull();
  });

  it('prevents prototype traversal in getSchemaForPath', () => {
    expect(getSchemaForPath(sampleSchema, ['__proto__'])).toBeNull();
    expect(getSchemaForPath(sampleSchema, ['constructor'])).toBeNull();
    expect(getSchemaForPath(sampleSchema, ['toString'])).toBeNull();
    expect(getSchemaForPath(sampleSchema, ['server', 'constructor'])).toBeNull();
  });

  it('caches schema URL extraction per Text instance in getSchemaUrlForDoc', () => {
    const doc1Text = '{"$schema": "https://example.com/schema-v1.json", "name": "app"}';
    const doc1 = Text.of(doc1Text.split('\n'));

    const extractSpy = vi.spyOn(documentParserRegistry, 'extractSchemaUrl');

    // First call extracts schema URL
    const url1 = getSchemaUrlForDoc(doc1, 'json');
    expect(url1).toBe('https://example.com/schema-v1.json');
    expect(extractSpy).toHaveBeenCalledTimes(1);

    // Second call on the SAME Text instance reuses cached result without calling extractSchemaUrl
    const url2 = getSchemaUrlForDoc(doc1, 'json');
    expect(url2).toBe('https://example.com/schema-v1.json');
    expect(extractSpy).toHaveBeenCalledTimes(1);

    // Call with a NEW Text instance invokes extractSchemaUrl again
    const doc2Text = '{"$schema": "https://example.com/schema-v2.json", "name": "app2"}';
    const doc2 = Text.of(doc2Text.split('\n'));
    const url3 = getSchemaUrlForDoc(doc2, 'json');
    expect(url3).toBe('https://example.com/schema-v2.json');
    expect(extractSpy).toHaveBeenCalledTimes(2);

    extractSpy.mockRestore();
  });
});
