# k6 Data Integration Patterns

## CSV Data

### Use Cases
- User credentials
- Product catalogs
- Tabular test data

### Implementation
```javascript
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

const csvData = new SharedArray('users', function () {
  return papaparse.parse(open('./data/users.csv'), { header: true }).data;
});

export default function () {
  const user = csvData[Math.floor(Math.random() * csvData.length)];
  console.log(`Testing with user: ${user.username}`);
}
```

## JSON Data

### Use Cases
- Complex nested data
- API request payloads
- Configuration data

### Implementation
```javascript
import { SharedArray } from 'k6/data';

const products = new SharedArray('products', function () {
  return JSON.parse(open('./data/products.json'));
});

export default function () {
  const product = products[__ITER % products.length];
  // Use product data...
}
```

## Environment Variables

### Use Cases
- Base URLs
- API tokens
- Environment-specific config

### Implementation
```javascript
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_TOKEN = __ENV.API_TOKEN;

if (!API_TOKEN) {
  throw new Error('API_TOKEN environment variable is required');
}

export default function () {
  const response = http.get(`${BASE_URL}/api/data`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` },
  });
}
```

## Recommendation Logic

| Scenario | Data Type | Rationale |
|----------|-----------|-----------|
| load/stress | CSV | Simple tabular, easy to generate large datasets |
| browser | JSON | Complex page state, nested structures |
| api (complex) | JSON | Nested payloads, flexible structure |
| api (simple) | CSV | Basic auth, simple params |
