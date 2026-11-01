import { describe, it, expect } from 'vitest';
import { jsonLanguage } from '@codemirror/lang-json';
import { findPositionForPath, parseJsonPointer } from './schema-position';

describe('schema-position', () => {
  it('parses json pointer correctly with fast-path for non-escaped strings and unescaping for tildes', () => {
    expect(parseJsonPointer('')).toEqual([]);
    expect(parseJsonPointer('/')).toEqual([]);
    expect(parseJsonPointer('/server/port')).toEqual(['server', 'port']);
    expect(parseJsonPointer('/items/0/name')).toEqual(['items', '0', 'name']);
    // Test escape sequence fast-path fallback when ~ is present
    expect(parseJsonPointer('/escaped~1slash/tilde~0')).toEqual(['escaped/slash', 'tilde~']);
    expect(parseJsonPointer('/unescaped/path/segments')).toEqual(['unescaped', 'path', 'segments']);
  });

  it('locates position in JSON document', () => {
    const jsonDoc = JSON.stringify(
      {
        server: {
          port: 'not-a-number',
          host: 'localhost'
        },
        items: ['first', 'second']
      },
      null,
      2
    );

    // Locate /server/port
    const posPort = findPositionForPath(jsonDoc, 'json', '/server/port');
    const portText = jsonDoc.slice(posPort.from, posPort.to);
    expect(portText).toBe('"not-a-number"');

    // Locate /items/1
    const posItem1 = findPositionForPath(jsonDoc, 'json', '/items/1');
    const item1Text = jsonDoc.slice(posItem1.from, posItem1.to);
    expect(item1Text).toBe('"second"');
  });

  it('locates position in YAML document', () => {
    const yamlDoc = `
server:
  port: not-a-number
  host: localhost
items:
  - first
  - second
`.trim();

    // Locate /server/port
    const posPort = findPositionForPath(yamlDoc, 'yaml', '/server/port');
    const portText = yamlDoc.slice(posPort.from, posPort.to);
    expect(portText.trim()).toBe('not-a-number');

    // Locate /items/0
    const posItem0 = findPositionForPath(yamlDoc, 'yaml', '/items/0');
    const item0Text = yamlDoc.slice(posItem0.from, posItem0.to);
    expect(item0Text.trim()).toContain('first');
  });

  it('handles missing required property by highlighting parent key', () => {
    const jsonDoc = JSON.stringify(
      {
        server: {
          host: 'localhost'
        }
      },
      null,
      2
    );

    const pos = findPositionForPath(jsonDoc, 'json', '/server', 'required', { missingProperty: 'port' });
    const text = jsonDoc.slice(pos.from, pos.to);
    expect(text).toBe('"server"');
  });

  it('uses optional pre-parsed tree when provided to avoid re-parsing', () => {
    const jsonDoc = JSON.stringify(
      {
        server: {
          port: 'not-a-number',
          host: 'localhost'
        }
      },
      null,
      2
    );

    const parsedTree = jsonLanguage.parser.parse(jsonDoc);
    const posPortWithTree = findPositionForPath(jsonDoc, 'json', '/server/port', undefined, undefined, parsedTree);
    const posPortWithoutTree = findPositionForPath(jsonDoc, 'json', '/server/port');

    expect(posPortWithTree).toEqual(posPortWithoutTree);
    const portText = jsonDoc.slice(posPortWithTree.from, posPortWithTree.to);
    expect(portText).toBe('"not-a-number"');
  });

  it('safely handles prototype traversal keys in instancePath', () => {
    const jsonDoc = JSON.stringify({ server: { host: 'localhost' } }, null, 2);

    const posProto = findPositionForPath(jsonDoc, 'json', '/__proto__/polluted');
    expect(posProto).toEqual({ from: 0, to: 1 });

    const posCtor = findPositionForPath(jsonDoc, 'json', '/constructor/prototype');
    expect(posCtor).toEqual({ from: 0, to: 1 });

    const posProtoSegment = findPositionForPath(jsonDoc, 'json', '/server/prototype/host');
    expect(posProtoSegment).toEqual({ from: 0, to: 1 });
  });

  it('correctly extracts key node from Property and Pair syntax nodes in getKeyNodeFromProperty', () => {
    const jsonDoc = '{"server": {"port": 8080}}';
    const jsonTree = jsonLanguage.parser.parse(jsonDoc);
    const posPort = findPositionForPath(jsonDoc, 'json', '/server/port', undefined, undefined, jsonTree);
    expect(jsonDoc.slice(posPort.from, posPort.to)).toBe('8080');

    const yamlDoc = 'server:\n  port: 8080';
    const posYamlPort = findPositionForPath(yamlDoc, 'yaml', '/server/port');
    expect(yamlDoc.slice(posYamlPort.from, posYamlPort.to).trim()).toBe('8080');
  });

  it('correctly matches key nodes across varying lengths, quotes, and positions in JSON and YAML', () => {
    // Test JSON document with multiple keys of different lengths (shorter, matching, longer, single & double quotes)
    const jsonDoc = JSON.stringify(
      {
        a: 1, // key shorter than segment 'server'
        description: 'long key', // key longer than segment 'server'
        server: {
          short: 123,
          port: 8080,
          longerPropertyName: 'val'
        }
      },
      null,
      2
    );

    const posServerPort = findPositionForPath(jsonDoc, 'json', '/server/port');
    expect(jsonDoc.slice(posServerPort.from, posServerPort.to)).toBe('8080');

    // Test YAML document with quoted and unquoted keys of varying lengths
    const yamlDoc = `
a: 1
'description': long key
"server":
  'short': 123
  "port": 8080
  longerPropertyName: val
`.trim();

    const posYamlPort = findPositionForPath(yamlDoc, 'yaml', '/server/port');
    expect(yamlDoc.slice(posYamlPort.from, posYamlPort.to).trim()).toBe('8080');

    const posYamlShort = findPositionForPath(yamlDoc, 'yaml', '/server/short');
    expect(yamlDoc.slice(posYamlShort.from, posYamlShort.to).trim()).toBe('123');

    // Test unquoted key matching longer, matching, and shorter in YAML
    const posYamlLonger = findPositionForPath(yamlDoc, 'yaml', '/server/longerPropertyName');
    expect(yamlDoc.slice(posYamlLonger.from, posYamlLonger.to).trim()).toBe('val');
  });

  it('correctly matches quoted keys containing escape sequences in JSON and YAML', () => {
    const jsonDoc = '{\n  "with\\"quote": 42,\n  "normal": 99\n}';
    const posJson = findPositionForPath(jsonDoc, 'json', '/with"quote');
    expect(jsonDoc.slice(posJson.from, posJson.to)).toBe('42');

    const yamlDoc = 'with"quote: 42\n\'can\'\'t\': 99';
    const posYamlEscaped = findPositionForPath(yamlDoc, 'yaml', "/can't");
    expect(yamlDoc.slice(posYamlEscaped.from, posYamlEscaped.to).trim()).toBe('99');
  });
});
