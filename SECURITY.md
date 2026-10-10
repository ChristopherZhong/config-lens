# Security Policy

## Overview

ConfigLens is committed to ensuring the security and privacy of our users. As a static, client-side Web application designed for inspecting, linting, formatting, and comparing JSON and YAML documents, ConfigLens processes all document data strictly within the user's browser.

This document outlines our security policies, supported versions, instructions for reporting security vulnerabilities, and security architecture details.

---

## Supported Versions

Only the latest release of ConfigLens receives security updates and bug fixes. We encourage all users and host deployment environments to remain on the latest release.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security of ConfigLens seriously. If you discover or suspect a security vulnerability, please report it to us responsibly so that we can address it promptly.

### Preferred Reporting Channel

Please report security vulnerabilities through **GitHub Private Vulnerability Reporting**:

1. Navigate to the [ConfigLens GitHub Repository](https://github.com/ChristopherZhong/config-lens).
2. Click on the **Security** tab.
3. Select **Vulnerabilities** under "Reporting".
4. Click **Report a vulnerability** to open a private advisory form.

If Private Vulnerability Reporting is unavailable, please open a confidential security advisory or reach out directly to the maintainers via GitHub.

### What to Include in Your Report

To help us evaluate and address the issue efficiently, please include the following details in your report:

- **Type of Issue**: (e.g., XSS, prototype pollution, open redirect, dependency vulnerability, data exposure).
- **Component / Location**: Affected file(s), functions, or UI components.
- **Steps to Reproduce**: Detailed, step-by-step instructions or a minimal Proof of Concept (PoC).
- **Impact**: Potential security impact and vector of exploitation.
- **Suggested Remediation**: (Optional) Recommended code fixes or mitigations.

### Response SLAs & Disclosure Policy

- **Acknowledgment**: We aim to acknowledge receipt of vulnerability reports within **48 hours**.
- **Assessment**: We will evaluate the report and provide an initial assessment and estimated timeframe for remediation within **5 business days**.
- **Fix & Disclosure**: Once a resolution is developed and verified, we will issue a patch release and publish a Security Advisory. We request that reporters adhere to **Coordinated Vulnerability Disclosure** and refrain from publicly disclosing the issue until a patch has been made available.

---

## Security & Privacy Architecture

ConfigLens is engineered with a privacy-first, client-side-only security posture.

### 1. Client-Side Processing & Data Isolation
- **Zero Backend**: ConfigLens runs entirely in the browser as a client-side Single Page Application (SPA).
- **No Data Exfiltration**: User documents, configuration files, and diff comparisons are never uploaded to any remote server or backend service.

### 2. External Schema Fetching (`$schema`)
- When documents specify a `$schema` URL, ConfigLens fetches the schema definition directly from the user's browser.
- **Protocol Restrictions**: Only valid `http://` and `https://` URLs are permitted. Non-HTTP schemes and unsafe protocol handlers are blocked.
- **Schema Caching**: Fetched JSON Schemas are compiled using [AJV](https://ajv.js.org/) and cached in memory during the browser session to minimize redundant network requests.

### 3. Prototype Pollution Guards
- Schema property resolution and JSON pointer traversals explicitly guard against prototype pollution vectors (`__proto__`, `constructor`, `prototype`) and verify property ownership via `Object.prototype.hasOwnProperty`.

### 4. LocalStorage & Persistence
- Application state (active document mode, theme preference, and draft editor content) is stored locally in browser `localStorage` under keys prefixed with `config-lens-*`.
- Users can clear editor content or browser storage at any time to purge cached local state.

---

## Supply Chain & Automated Controls

- **Dependabot Updates**: Dependencies are automatically checked and updated weekly via GitHub Dependabot.
- **Strict TypeScript**: The codebase enforces strict TypeScript options (`noImplicitAny`, strict null checks, strict standard linting).
- **Continuous Integration**: Automated CI pipelines run static typechecking, unit testing (Vitest), and end-to-end browser testing (Playwright) on every pull request and push to `main`.
