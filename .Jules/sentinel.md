## 2025-05-18 - JSON Schema Pointer Prototype Traversal Prevention
**Vulnerability:** Traversing schema paths or resolving JSON `$ref` pointers in `schema-hover.ts` allowed indexing prototype properties like `__proto__`, `constructor`, `prototype`, or inherited methods like `toString`.
**Learning:** Naive object property indexing `obj[key]` evaluates truthy for inherited `Object.prototype` properties and returns prototype objects when indexing `__proto__` or `constructor`.
**Prevention:** Block special prototype keys (`__proto__`, `constructor`, `prototype`) and verify `Object.prototype.hasOwnProperty.call(obj, key)` before accessing object properties.

## 2025-05-18 - Schema URL SSRF and Private Network Access Prevention
**Vulnerability:** External `$schema` URLs in JSON/YAML documents could target loopback (`localhost`, `127.0.0.1`, `[::1]`), cloud metadata endpoints (`169.254.169.254`), private IP ranges (`10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`), or internal network hosts (`.local`, `.internal`).
**Learning:** Generic HTTP/HTTPS URL checks without hostname filtering allow `fetch` to request arbitrary internal endpoints or cloud metadata services.
**Prevention:** Filter hostnames in `isValidHttpUrl` against loopback, cloud metadata, private RFC1918 IP addresses, and internal domain suffixes (`.local`, `.internal`).

## 2025-05-19 - SSRF Bypass via IPv4-Mapped IPv6 and Non-Standard Loopback Subnets
**Vulnerability:** Exact hostname string matching for `127.0.0.1` and `0.0.0.0` allowed SSRF via non-standard loopback IP addresses (e.g., `127.0.0.2`, `127.254.0.1`), IPv4-mapped IPv6 syntax (`[::ffff:127.0.0.1]`, `[::ffff:10.0.0.1]`), `0.x.x.x` addresses, or Carrier-Grade NAT IPs (`100.64.0.0/10`).
**Learning:** `new URL().hostname` retains IPv6 brackets (`[...]`) and IPv4-mapped IPv6 prefixes (`::ffff:`), preventing standard IPv4 prefix checks from matching.
**Prevention:** Strip IPv6 bracket notation, unwrap `::ffff:` IPv4-mapped IPv6 prefixes, and check against full subnet prefix ranges (`127.0.0.0/8`, `0.0.0.0/8`, `100.64.0.0/10`).
