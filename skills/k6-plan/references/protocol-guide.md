# k6 Protocol-Specific Patterns

## HTTP

### Basic GET Request
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const response = http.get('https://api.example.com/users', {
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

export default function () {
  const responses = http.batch([
    ['GET', 'https://api.example.com/users'],
    ['GET', 'https://api.example.com/products'],
    ['POST', 'https://api.example.com/orders', JSON.stringify({ item: 'test' })],
  ]);
  
  // Process responses[0], responses[1]
}
```

### POST with Auth
```javascript
import http from 'k6/http';

export default function () {
  const payload = JSON.stringify({
    username: 'user@example.com',
    password: 'secret',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
    timeout: '30s',
  };
  
  http.post('https://api.example.com/login', payload, params);
}
```

## gRPC

### Basic Client Setup
```javascript
import grpc from 'k6/net/grpc';
import { check } from 'k6';

const client = new grpc.Client();
client.load(['definitions'], 'service.proto');

export default function () {
  client.connect('grpc.example.com:50051', {
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

export default async function () {
  const page = await browser.newPage();
  
  try {
    await page.goto('https://example.com');
    await page.waitForSelector('[data-testid="login-button"]');
    
    await page.fill('[data-testid="username"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'secret');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForSelector('[data-testid="dashboard"]');
  } finally {
    await page.close();
  }
}
```

### Collecting Web Vitals
```javascript
import { browser } from 'k6/browser';

export default async function () {
  const page = await browser.newPage();
  
  await page.goto('https://example.com');
  
  const fcp = await page.evaluate(() => {
    const [entry] = performance.getEntriesByName('first-contentful-paint');
    return entry ? entry.startTime : null;
  });
  
  console.log(`First Contentful Paint: ${fcp}ms`);
  
  await page.close();
}
```
