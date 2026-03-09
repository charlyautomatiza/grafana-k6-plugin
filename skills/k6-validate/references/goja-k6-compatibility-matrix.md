# Goja/k6 JavaScript Compatibility Matrix

## Overview

k6 uses [Goja](https://github.com/dop251/goja) as its JavaScript runtime, which implements ECMAScript 5.1 with some ES6+ features. This is **not** a Node.js environment. Many Node.js modules and APIs will not work in k6.

## k6 Built-in Modules (Allowed)

These are the only module imports natively supported in k6:

### Core k6 Modules
| Module | Purpose | Stability |
|--------|---------|-----------|
| `k6` | Core metrics, check, group, sleep | ✅ Stable |
| `k6/http` | HTTP client for REST/GraphQL APIs | ✅ Stable |
| `k6/ws` | WebSocket client | ✅ Stable |
| `k6/metrics` | Custom metrics (Counter, Gauge, Rate, Trend) | ✅ Stable |
| `k6/data` | SharedArray for test data | ✅ Stable |
| `k6/encoding` | Base64 encoding/decoding | ✅ Stable |
| `k6/crypto` | Cryptographic functions (hashing, HMAC) | ✅ Stable |
| `k6/html` | HTML parsing and selection | ✅ Stable |

### Protocol-Specific Modules
| Module | Purpose | Stability |
|--------|---------|-----------|
| `k6/net/grpc` | gRPC client | ✅ Stable |
| `k6/browser` | Browser automation (Chromium-based) | ✅ Stable |

### Utility Modules
| Module | Purpose | Stability |
|--------|---------|-----------|
| `k6/execution` | Test execution metadata (scenario, VU ID) | ✅ Stable |
| `k6/timers` | setTimeout, setInterval (limited support) | ⚠️ Limited |

## Node.js Modules (Prohibited)

The following Node.js built-in modules **do not work** in k6 and will cause runtime errors:

| Module | Status | Alternative in k6 |
|--------|--------|------------------|
| `fs` | ❌ Not available | Use `open()` from k6 for file access |
| `path` | ❌ Not available | Use string manipulation |
| `os` | ❌ Not available | Limited via `k6/execution` |
| `process` | ❌ Not available | Use `__ENV` for environment variables |
| `http` / `https` | ❌ Not available | Use `k6/http` |
| `net` | ❌ Not available | Not applicable in load testing |
| `child_process` | ❌ Not available | Not applicable |
| `cluster` | ❌ Not available | Use k6 distributed execution |
| `crypto` (Node.js) | ❌ Not available | Use `k6/crypto` |
| `stream` | ❌ Not available | Not applicable |
| `buffer` | ⚠️ Partial | Use `encoding` module or typed arrays |
| `util` | ❌ Not available | Use native JavaScript alternatives |

## npm Packages (Generally Prohibited)

Most npm packages designed for Node.js will **not work** in k6 because:
1. They rely on Node.js APIs (`fs`, `http`, `process`, etc.)
2. They use CommonJS `require()` (k6 uses ES6 `import`)
3. They depend on the V8 runtime (k6 uses Goja)

**Exception:** Pure JavaScript libraries with no Node.js dependencies may work if bundled correctly (using Webpack/Babel).

## jslib - k6 Community Libraries (Recommended)

[jslib](https://jslib.k6.io/) provides k6-compatible utility libraries:

| Library | Purpose | Stability | When to Use |
|---------|---------|-----------|-------------|
| `k6/x/faker` | Generate fake data (names, emails, etc.) | ✅ Stable | Data-driven tests |
| `k6/x/expect` | Assertions (similar to Jest) | ✅ Stable | Expressive checks |
| `k6/utils` | Common utilities (random, parsing) | ✅ Stable | General scripting |

### Using jslib Libraries
```javascript
import { randomItem, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
```

## ECMAScript Support

k6's Goja runtime supports:

### ✅ Fully Supported (ES5.1 + partial ES6)
- `let`, `const` (block-scoped variables)
- Arrow functions `() => {}`
- Template literals `` `Hello ${name}` ``
- Destructuring `const { a, b } = obj`
- Default parameters `function(a = 1) {}`
- Spread operator `...args`
- `Promise` (limited - use with caution in load tests)
- `Map`, `Set`
- `for...of` loops

### ⚠️ Limited or Unstable
- `async`/`await` (available but not recommended for high concurrency)
- `class` syntax (works but not idiomatic in k6)
- Modules (`import`/`export` work, `require()` does not)

### ❌ Not Supported
- `import()` dynamic imports
- Top-level `await`
- Node.js-specific globals (`__dirname`, `__filename`, `global`)

## Common Runtime Errors

### ❌ `Cannot find module 'xyz'`
**Cause:** Trying to import Node.js module or npm package  
**Fix:** Use k6 built-in modules or jslib alternatives

### ❌ `ReferenceError: require is not defined`
**Cause:** Using CommonJS `require()` instead of ES6 `import`  
**Fix:** Convert to `import { x } from 'module'`

### ❌ `TypeError: x is not a function`
**Cause:** Using Node.js API (e.g., `fs.readFileSync()`)  
**Fix:** Use k6 API (e.g., `open('file.txt')`)

### ❌ `SharedArray data must be initialized in init context`
**Cause:** Initializing `SharedArray` inside VU code  
**Fix:** Move `SharedArray` initialization to global scope (init context)

## Validation Rules

When validating k6 scripts:

1. **Flag ES6+ features beyond Goja support** (e.g., top-level `await`) → **ERROR**
2. **Flag Node.js imports** (`fs`, `path`, etc.) → **ERROR**
3. **Flag npm packages** (unless proven k6-compatible) → **WARNING**
4. **Recommend jslib** for common utilities → **INFO**
5. **Flag `async`/`await` in hot path** (iteration code) → **WARNING** (performance concern)

## References

- [k6 JavaScript API](https://grafana.com/docs/k6/latest/javascript-api/)
- [Goja ECMAScript compatibility](https://github.com/dop251/goja)
- [jslib community libraries](https://jslib.k6.io/)
- [k6 execution contexts](https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/)
