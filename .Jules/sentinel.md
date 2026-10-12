## 2025-05-18 - JSON Schema Pointer Prototype Traversal Prevention
**Vulnerability:** Traversing schema paths or resolving JSON `$ref` pointers in `schema-hover.ts` allowed indexing prototype properties like `__proto__`, `constructor`, `prototype`, or inherited methods like `toString`.
**Learning:** Naive object property indexing `obj[key]` evaluates truthy for inherited `Object.prototype` properties and returns prototype objects when indexing `__proto__` or `constructor`.
**Prevention:** Block special prototype keys (`__proto__`, `constructor`, `prototype`) and verify `Object.prototype.hasOwnProperty.call(obj, key)` before accessing object properties.

## 2025-05-18 - Schema URL SSRF and Private Network Access Prevention
**Vulnerability:** External `$schema` URLs in JSON/YAML documents could target loopback (`localhost`, `127.0.0.1`, `[::1]`), cloud metadata endpoints (`169.254.169.254`), private IP ranges (`10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`), or internal network hosts (`.local`, `.internal`).
**Learning:** Generic HTTP/HTTPS URL checks without hostname filtering allow `fetch` to request arbitrary internal endpoints or cloud metadata services.
**Prevention:** Filter hostnames in `isValidHttpUrl` against loopback, cloud metadata, private RFC1918 IP addresses, and internal domain suffixes (`.local`, `.internal`).
