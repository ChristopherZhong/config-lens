## 2025-05-18 - JSON Schema Pointer Prototype Traversal Prevention
**Vulnerability:** Traversing schema paths or resolving JSON `$ref` pointers in `schema-hover.ts` allowed indexing prototype properties like `__proto__`, `constructor`, `prototype`, or inherited methods like `toString`.
**Learning:** Naive object property indexing `obj[key]` evaluates truthy for inherited `Object.prototype` properties and returns prototype objects when indexing `__proto__` or `constructor`.
**Prevention:** Block special prototype keys (`__proto__`, `constructor`, `prototype`) and verify `Object.prototype.hasOwnProperty.call(obj, key)` before accessing object properties.

## 2025-05-18 - Schema URL SSRF and Private Network Access Prevention
**Vulnerability:** External `$schema` URLs in JSON/YAML documents could target loopback (`localhost`, `127.0.0.1`, `[::1]`), cloud metadata endpoints (`169.254.169.254`), private IP ranges (`10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`), or internal network hosts (`.local`, `.internal`).
**Learning:** Generic HTTP/HTTPS URL checks without hostname filtering allow `fetch` to request arbitrary internal endpoints or cloud metadata services.
**Prevention:** Filter hostnames in `isValidHttpUrl` against loopback, cloud metadata, private RFC1918 IP addresses, and internal domain suffixes (`.local`, `.internal`).

## 2025-05-18 - IPv4-Compatible IPv6 SSRF Regex Bypass Fix
**Vulnerability:** IPv4-compatible IPv6 addresses for private subnets like `10.1.0.0/8` - `10.255.255.255` (e.g. `http://[::10.1.2.3]`) bypassed `isValidHttpUrl` SSRF validation because the hex regex matched `a00` (`10.0.x.x`) rather than all `10.x.x.x` hex representations (`a00`–`aff`).
**Learning:** URL constructors normalize IPv4 addresses in IPv6 bracket notation into hexadecimal (`0a00`–`0aff` -> `a00`–`aff`). Single-block hex matching can leave subnets in the same RFC1918 range unprotected.
**Prevention:** Use full hex byte range matching (`a[0-9a-f]{2}`) for 8-bit subnet prefixes and test non-zero subnet variations in IPv6 representations.

## 2025-05-18 - FQDN Trailing Dot Hostname SSRF Bypass
**Vulnerability:** Fully Qualified Domain Names (FQDNs) ending with a trailing dot (e.g., `http://localhost./schema.json`, `http://service.local./schema.json`, `http://127.0.0.1.nip.io./schema.json`) bypassed `isValidHttpUrl` SSRF filters because `parsed.hostname` retained the trailing dot (`localhost.`), causing `.endsWith('.local')` or `=== 'localhost'` checks to fail.
**Learning:** Standard WHATWG `URL` parsers preserve trailing dots in FQDN hostnames, but network resolvers strip the trailing dot when querying DNS or making HTTP requests.
**Prevention:** Always normalize hostnames by stripping trailing dots (`.replace(/\.$/, '')`) before validating against restricted domain suffixes and loopback identifiers.

## 2026-10-23 - NAT64 and 6to4 IPv6 Transition Address SSRF Bypass Fix
**Vulnerability:** External `$schema` URLs using NAT64 (`64:ff9b::/96`) or 6to4 (`2002::/16`) transition prefixes (e.g. `http://[64:ff9b::7f00:1]` or `http://[2002:7f00:1::]` for loopback `127.0.0.1`, `http://[64:ff9b::a9fe:a9fe]` for AWS metadata `169.254.169.254`) bypassed `isValidHttpUrl` SSRF filters because the prefix regex was restricted to IPv4-mapped/compatible IPv6 prefixes (`^::(ffff:)?`).
**Learning:** IPv6 transition technologies like NAT64 (`64:ff9b::/96`) and 6to4 (`2002::/16`) embed IPv4 addresses in hexadecimal within distinct 16-bit prefix blocks that differ from standard IPv4-mapped IPv6 notation (`::ffff:`).
**Prevention:** Include all active IPv6 transition mechanism prefixes (`64:ff9b::`, `2002:`) alongside `::` and `::ffff:` when matching hexadecimal representations of restricted IPv4 ranges.
