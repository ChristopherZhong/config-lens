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

## 2026-10-24 - IPv6 Site-Local, Multicast, and IPv4 Multicast SSRF Bypass Fix
**Vulnerability:** External `$schema` URLs targeting IPv6 site-local (`fec0::/10`), IPv6 multicast (`ff00::/8`), IPv4 multicast (`224.0.0.0/4`), or reserved/broadcast (`240.0.0.0/4`, `255.255.255.255`) IP ranges bypassed `isValidHttpUrl` SSRF filters.
**Learning:** SSRF filters that check IPv6 link-local (`fe80::/10`) and private IPv4 ranges often omit IPv6 site-local (`fec0::/10`), multicast (`ff00::/8`), and IPv4 multicast/reserved ranges, allowing requests to non-public network endpoints.
**Prevention:** Extend hostname filters in `isValidHttpUrl` to block IPv6 site-local, multicast, and IPv4 multicast/reserved ranges alongside loopback and private unicast IP ranges.

## 2026-10-25 - Benchmarking Range (198.18.0.0/15) SSRF Bypass Fix
**Vulnerability:** External `$schema` URLs targeting RFC 2544 / RFC 6890 inter-network benchmarking IP subnets (`198.18.0.0/15`, i.e., `198.18.0.0` - `198.19.255.255`) bypassed `isValidHttpUrl` SSRF filters in standard IPv4 notation and IPv6 transition address formats (`::ffff:`, `64:ff9b::`, `2002:` in hex `c612` / `c613`).
**Learning:** SSRF filters commonly miss benchmarking and inter-network testing IP ranges (RFC 2544 / RFC 6890) which are reserved non-routable subnets.
**Prevention:** Include `/^198\.(1[89])\./` and corresponding IPv6 transition hex patterns (`c61[23]`) in SSRF URL filtering logic alongside private and loopback IP ranges.

## 2026-10-26 - Documentation and 6to4 Anycast Relay Subnets SSRF Bypass Fix
**Vulnerability:** External `$schema` URLs targeting documentation test subnets (TEST-NET-1 `192.0.2.0/24`, TEST-NET-2 `198.51.100.0/24`, TEST-NET-3 `203.0.113.0/24`) and 6to4 Anycast Relay subnets (`192.88.99.0/24`) bypassed `isValidHttpUrl` SSRF filters in standard IPv4, IPv4-mapped, NAT64, and 6to4 IPv6 transition formats.
**Learning:** SSRF filters often omit reserved RFC 5737 documentation subnets and RFC 3068 6to4 Relay Anycast ranges which should not be requested as remote schema endpoints.
**Prevention:** Include regex checks for `192.0.2.x`, `198.51.100.x`, `203.0.113.x`, `192.88.99.x` and their IPv6 transition hex prefixes (`c000`, `c633`, `cb00`, `c058`) in SSRF hostname validation routines.
