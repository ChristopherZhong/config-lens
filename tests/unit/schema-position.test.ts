import { describe, it, expect } from 'vitest';
import { findPositionForPath, parseJsonPointer } from '../../src/utils/schema-position';

describe('schema-position', () => {
  it('parses json pointer correctly', () => {
    expect(parseJsonPointer('')).toEqual([]);
    expect(parseJsonPointer('/')).toEqual([]);
    expect(parseJsonPointer('/server/port')).toEqual(['server', 'port']);
    expect(parseJsonPointer('/items/0/name')).toEqual(['items', '0', 'name']);
    expect(parseJsonPointer('/escaped~1slash/tilde~0')).toEqual(['escaped/slash', 'tilde~']);
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

  it('safely handles prototype traversal keys in instancePath', () => {
    const jsonDoc = JSON.stringify({ server: { host: 'localhost' } }, null, 2);

    const posProto = findPositionForPath(jsonDoc, 'json', '/__proto__/polluted');
    expect(posProto).toEqual({ from: 0, to: 1 });

    const posCtor = findPositionForPath(jsonDoc, 'json', '/constructor/prototype');
    expect(posCtor).toEqual({ from: 0, to: 1 });

    const posProtoSegment = findPositionForPath(jsonDoc, 'json', '/server/prototype/host');
    expect(posProtoSegment).toEqual({ from: 0, to: 1 });
  });
});
