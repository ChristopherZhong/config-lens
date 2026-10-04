import { describe, it, expect, vi } from 'vitest';
import {
  resolveSchemaRef,
  dereferenceSchema,
  getSchemaForPath,
  createHoverTooltipElement,
  documentParserRegistry
} from '../../src/utils/schema-hover';

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

  it('dereferences schema correctly', () => {
    const subSchema = { $ref: '#/$defs/ServerConfig' };
    const derefed = dereferenceSchema(sampleSchema, subSchema);
    expect(derefed?.type).toBe('object');
    const props = derefed?.properties as Record<string, Record<string, unknown>>;
    expect(props?.port?.type).toBe('integer');
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
});
