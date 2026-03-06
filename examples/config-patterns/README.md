# Configuration Patterns in k6

This directory contains examples of flexible, non-hardcoded configuration patterns for k6 scripts.

## The Problem: Hardcoded Values

❌ **BAD - Hardcoded URLs, tokens, credentials:**
```javascript
const baseUrl = 'https://api.example.com';  // Not flexible
const token = 'secret-token-123';            // Exposed in repo!
const env = 'prod';                         // Can't easily change
```

✅ **GOOD - Externalized configuration:**
```javascript
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const token = __ENV.API_TOKEN || '';
const env = __ENV.ENVIRONMENT || 'local';
```

## Configuration Precedence (Lowest → Highest)

When multiple configuration sources exist, k6 follows this priority order:

```
1. Default values in script        (lowest priority)
   ↓
2. config.json file (--config flag)
   ↓
3. export const options in script
   ↓
4. Environment variables (K6_* or --env)
   ↓
5. CLI flags (--vus, --duration)   (highest priority)
```

### Example: How Precedence Works

Script default:
```javascript
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
```

Config file (config.json):
```json
{ "hosts": { "example.com": "10.0.0.1" } }
```

Run command:
```bash
k6 run --env BASE_URL=https://staging.api.com script.js
```

**Result**: `BASE_URL` = `https://staging.api.com` (CLI flag wins)

## Using Environment Variables

### Basic Pattern
```bash
k6 run --env BASE_URL=https://api.example.com \
       --env API_TOKEN=xyz123 \
       script.js
```

### With Defaults
```javascript
const apiToken = __ENV.API_TOKEN || 'default-token';
const timeout = __ENV.TIMEOUT || '30s';
const retries = parseInt(__ENV.RETRIES || '3');
```

### Configuration Variables to Pass

| Variable | Purpose | Example |
|----------|---------|---------|
| `BASE_URL` | API endpoint | `https://api.example.com` |
| `API_TOKEN` | Authentication | `Bearer xyz123` |
| `USERNAME` | User credentials | `admin` |
| `PASSWORD` | User password | `secret123` |
| `ENVIRONMENT` | Target environment | `staging` |
| `DATA_FILE` | Data source path | `./data/users.csv` |

## Multi-Environment Setup

### Structure
```
project/
├── k6-common.json         # Shared config (thresholds, stages)
├── k6-local.json          # Local environment overrides
├── k6-staging.json        # Staging overrides
├── k6-prod.json           # Production overrides
├── script.js              # Main test
└── data/
    ├── users.csv          # Test data
    └── endpoints.json     # API endpoints
```

### Running Against Different Environments

**Local:**
```bash
k6 run --env ENVIRONMENT=local --config k6-local.json script.js
```

**Staging:**
```bash
k6 run --env ENVIRONMENT=staging --config k6-staging.json script.js
```

**Production:**
```bash
K6_THRESHOLDS='{"http_req_duration": ["p(95)<200"]}' \
k6 run --env ENVIRONMENT=prod --config k6-prod.json \
       --env PROD_TOKEN=xxx --vus 50 script.js
```

## Security Best Practices

### ✅ DO
- Store tokens in environment variables, never in script
- Use `.env` file for local development, add to `.gitignore`
- In CI/CD, use encrypted secrets (GitHub Secrets, GitLab Secrets)
- Use `__ENV` with fallback to defaults for non-sensitive config

### ❌ DON'T
- Hardcode API tokens in script (`const token = 'abc123'`)
- Commit `.env` files with real credentials
- Pass tokens as query parameters (use headers)
- Log tokens to console or output files

### Using .env File Locally

Create `.env`:
```bash
export BASE_URL=https://dev.api.example.com
export API_TOKEN=dev-token-12345
export USERNAME=testuser
export PASSWORD=testpass
```

Load and run:
```bash
source .env
k6 run script.js
```

Add to `.gitignore`:
```
.env
.env.local
secrets/
```

## Configuration File Example (k6-staging.json)

```json
{
  "stages": [
    { "duration": "2m", "target": 30 },
    { "duration": "10m", "target": 30 },
    { "duration": "2m", "target": 0 }
  ],
  "thresholds": {
    "http_req_duration": ["p(95)<500", "p(99)<1000"],
    "http_req_failed": ["rate<0.01"]
  },
  "noConnectionReuse": false,
  "timeoutMs": 30000,
  "userAgent": "k6-staging"
}
```

## Examples in This Directory

| File | Pattern | Use Case |
|------|---------|----------|
| `config.json` | Base configuration template | Starting point for config files |
| `env-based.js` | Environment variables | Parameterized scripts with `__ENV` |
| `multi-env.js` | Environment selection | Different URLs for local/dev/staging/prod |
| `secrets-safe.js` | Secure credentials | Safe token/password handling |

## Tips & Tricks

### Validate Environment Variables
```javascript
if (!__ENV.API_TOKEN) {
  throw new Error('API_TOKEN not set. Use: --env API_TOKEN=xyz');
}
```

### Log Configuration at Startup
```javascript
export function setup() {
  console.log(`Testing: ${__ENV.BASE_URL}`);
  console.log(`Environment: ${__ENV.ENVIRONMENT || 'unknown'}`);
}
```

### Dynamic Endpoint Selection
```javascript
const endpoints = {
  users: `${baseUrl}/api/users`,
  products: `${baseUrl}/api/products`,
  orders: `${baseUrl}/api/orders`,
};
```

### Conditional Execution
```javascript
if (__ENV.ENVIRONMENT === 'prod') {
  // Production: use strict SLAs
  export const options = { /* stricter config */ };
} else {
  // Dev: more lenient
  export const options = { /* lenient config */ };
}
```
