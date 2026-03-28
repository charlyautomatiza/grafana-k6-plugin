# k6-validate Remediation Playbooks

Copy-paste-ready templates for common validation findings.

## Playbook 1: Anonymous Default Function

**Problem**
- Anonymous default export reduces traceability and makes debugging harder.

**Before**
```javascript
export default function() {
  http.get(`${__ENV.BASE_URL}/health`, { timeout: '30s' });
}
```

**After**
```javascript
export default function runHttpSmoke() {
  http.get(`${__ENV.BASE_URL}/health`, { timeout: '30s' });
}
```

## Playbook 2: Missing Sleep Between Iterations

**Problem**
- Tight loops can create unrealistic load and noisy latency.

**Before**
```javascript
import http from 'k6/http';

export default function runHttpLoad() {
  http.get(`${__ENV.BASE_URL}/catalog`, { timeout: '30s' });
}
```

**After**
```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export default function runHttpLoad() {
  http.get(`${__ENV.BASE_URL}/catalog`, { timeout: '30s' });
  sleep(1);
}
```

## Playbook 3: Hard-Coded URL

**Problem**
- Hard-coded targets reduce portability and can hit production unintentionally.

**Before**
```javascript
const BASE_URL = 'https://api.prod.example.com';
```

**After**
```javascript
const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
  throw new Error('BASE_URL environment variable is required');
}
```

## Playbook 4: Missing Checks

**Problem**
- Without checks, the test cannot assert functional correctness.

**Before**
```javascript
import http from 'k6/http';

export default function runHttpLoad() {
  http.get(`${__ENV.BASE_URL}/users`, { timeout: '30s' });
}
```

**After**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function runHttpLoad() {
  const res = http.get(`${__ENV.BASE_URL}/users`, { timeout: '30s' });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Playbook 5: Missing Timeout

**Problem**
- Requests without explicit timeout may not align with SLA expectations.

**Before**
```javascript
http.get(`${__ENV.BASE_URL}/users`);
```

**After**
```javascript
http.get(`${__ENV.BASE_URL}/users`, { timeout: '30s' });
```

## Playbook 6: Browser Lifecycle Leak (Missing Close on Some Paths)

**Problem**
- Closing `page` only in one branch can leak resources in browser scenarios.

**Before**
```javascript
export default async function runBrowserFlow() {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(__ENV.BASE_URL);
    await page.click('[data-testid="checkout"]');
  } catch (err) {
    await page.close();
  }
}
```

**After**
```javascript
export default async function runBrowserFlow() {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(__ENV.BASE_URL);
    await page.click('[data-testid="checkout"]');
  } finally {
    await page.close();
    await context.close();
  }
}
```

## Playbook 7: gRPC Reconnect Per Iteration

**Problem**
- Reconnecting per iteration creates avoidable overhead and unstable latency.

**Before**
```javascript
import grpc from 'k6/grpc';

export default function runGrpcLoad() {
  const client = new grpc.Client();
  client.load(['definitions'], 'service.proto');
  client.connect(__ENV.GRPC_ADDR, { plaintext: false });
  client.invoke('service.Method', { id: '1' });
  client.close();
}
```

**After**
```javascript
import grpc from 'k6/grpc';

const client = new grpc.Client();
client.load(['definitions'], 'service.proto');

export default function runGrpcLoad() {
  client.connect(__ENV.GRPC_ADDR, { plaintext: false, timeout: '10s' });
  client.invoke(
    'service.Method',
    { id: '1' },
    { metadata: { authorization: `Bearer ${__ENV.GRPC_TOKEN}` }, timeout: '5s' }
  );
}

export function teardown() {
  client.close();
}
```
