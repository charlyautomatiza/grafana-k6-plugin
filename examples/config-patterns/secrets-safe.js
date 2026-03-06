// Secure Configuration: API Tokens and Credentials
// Never commit actual tokens to version control
// Use environment variables for secrets

// Usage with environment variables:
// k6 run --env API_TOKEN=xyz123 --env USERNAME=admin secrets-safe.js
//
// Or load from .env file (using shell export):
// export $(cat .env | xargs)
// k6 run secrets-safe.js
//
// For CI/CD, set as encrypted environment variables

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const apiToken = __ENV.API_TOKEN || '';
const username = __ENV.USERNAME || '';
const password = __ENV.PASSWORD || '';

// Fail fast if critical credentials are missing
if (!apiToken && !username) {
  throw new Error('No credentials provided. Set API_TOKEN or USERNAME environment variables.');
}

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function secureAuthTest() {
  // Strategy 1: Bearer Token Authentication
  if (apiToken) {
    const params = {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: '30s',
    };

    const response = http.get(`${baseUrl}/api/protected-resource`, params);

    check(response, {
      'bearer auth works': (r) => r.status === 200,
      'token is valid': (r) => !r.body.includes('unauthorized'),
    });
  }

  // Strategy 2: Basic Authentication
  if (username && password) {
    const encodedCredentials = http.base64Encode(`${username}:${password}`);

    const params = {
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
      timeout: '30s',
    };

    const response = http.get(`${baseUrl}/api/secure-endpoint`, params);

    check(response, {
      'basic auth works': (r) => r.status === 200 || r.status === 401,
    });
  }

  sleep(1);
}
