# k6 Protocol-Specific Patterns

## HTTP

### Timeout Coherence Rule

1. Include explicit request timeout for executable HTTP examples (`timeout: '30s'` baseline).
2. Use stricter values only when SLA requires them and document the rationale.
3. Missing explicit timeout should be treated as a validation warning in `k6-validate`, not an automatic blocker.
4. Plan and validation guidance must not contradict: if plan emits explicit timeout, validation should not warn on timeout absence.

### Method Confirmation Checklist

Before generating executable HTTP scripts:

1. Confirm endpoint path and primary method.
2. For write methods (`POST`, `PUT`, `PATCH`), confirm payload contract and expected status codes.
3. Confirm auth mechanism and required environment variables.

### Basic GET Request
```javascript
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
  throw new Error('BASE_URL environment variable is required');
}

export default function () {
  const response = http.get(`${BASE_URL}/users`, {
    timeout: '30s',
    tags: { name: 'get-users' },
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### Batch Requests
```javascript
import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
  throw new Error('BASE_URL environment variable is required');
}

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/users`],
    ['GET', `${BASE_URL}/products`],
    [
      'POST',
      `${BASE_URL}/orders`,
      JSON.stringify({ item: 'test' }),
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
        tags: { name: 'create-order' },
      },
    ],
  ]);
  
  // Process responses[0], responses[1]
}
```

### Login and Token Extraction
```javascript
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL;
const API_USER = __ENV.API_USER;
const API_PASSWORD = __ENV.API_PASSWORD;

if (!BASE_URL || !API_USER || !API_PASSWORD) {
  throw new Error('BASE_URL, API_USER, and API_PASSWORD environment variables are required');
}

export default function () {
  const payload = JSON.stringify({
    username: API_USER,
    password: API_PASSWORD,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '30s',
    tags: { name: 'login' },
  };

  const loginRes = http.post(`${BASE_URL}/login`, payload, params);

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  let token;
  try {
    token = loginRes.json('token');
    if (!token) {
      throw new Error('token field missing');
    }
  } catch (err) {
    throw new Error(`Invalid login response JSON: ${err.message}`);
  }
}
```

### Authenticated POST
```javascript
import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL;
const API_TOKEN = __ENV.API_TOKEN;

if (!BASE_URL || !API_TOKEN) {
  throw new Error('BASE_URL and API_TOKEN environment variables are required');
}

export default function () {
  const payload = JSON.stringify({ item: 'test' });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    timeout: '30s',
    tags: { name: 'create-order' },
  };

  http.post(`${BASE_URL}/orders`, payload, params);
}
```

## gRPC

### Basic Client Setup
```javascript
import grpc from 'k6/grpc';
import { check } from 'k6';

const GRPC_ADDR = __ENV.GRPC_ADDR;

if (!GRPC_ADDR) {
  throw new Error('GRPC_ADDR environment variable is required');
}

const client = new grpc.Client();
client.load(['definitions'], 'service.proto');

export default function () {
  client.connect(GRPC_ADDR, {
    plaintext: false,
  });
  
  const request = { name: 'test' };
  const response = client.invoke('service.Method', request);
  
  check(response, {
    'status is OK': (r) => r && r.status === grpc.StatusOK,
  });
  
  client.close();
}
```

### With Metadata (Auth)
```javascript
const metadata = {
  'authorization': `Bearer ${__ENV.GRPC_TOKEN}`,
};

const response = client.invoke('service.Method', request, { metadata });
```

## Browser (k6/browser)

### Basic Page Interaction
```javascript
import { browser } from 'k6/browser';

const BASE_URL = __ENV.BASE_URL;
const UI_USER = __ENV.UI_USER;
const UI_PASSWORD = __ENV.UI_PASSWORD;

if (!BASE_URL || !UI_USER || !UI_PASSWORD) {
  throw new Error('BASE_URL, UI_USER, and UI_PASSWORD environment variables are required');
}

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(BASE_URL);
    
    await page.waitForSelector('input[name="login"]');
    await page.fill('input[name="login"]', UI_USER);
    
    await page.waitForSelector('input[name="password"]');
    await page.fill('input[name="password"]', UI_PASSWORD);
    
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 });
  } finally {
    await page.close();
    await context.close();
  }
}
```

### Collecting Web Vitals
```javascript
import { browser } from 'k6/browser';

const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
  throw new Error('BASE_URL environment variable is required');
}

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(BASE_URL);
    
    const fcp = await page.evaluate(() => {
      const [entry] = performance.getEntriesByName('first-contentful-paint');
      return entry ? entry.startTime : null;
    });
    
    console.log(`First Contentful Paint: ${fcp}ms`);
  } finally {
    await page.close();
    await context.close();
  }
}
```
