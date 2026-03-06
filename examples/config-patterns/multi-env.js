// Multi-Environment Configuration
// Demonstrates pattern for testing same script against different environments
// Supports: local, dev, staging, production

// Usage:
// k6 run --env ENVIRONMENT=local multi-env.js
// k6 run --env ENVIRONMENT=staging multi-env.js
// k6 run --env ENVIRONMENT=prod multi-env.js

import http from 'k6/http';
import { check, sleep } from 'k6';

// Environment mapping - define URLs per environment
const environments = {
  local: {
    baseUrl: 'http://localhost:3000',
    apiToken: 'local-token-12345',
    timeout: '10s',
  },
  dev: {
    baseUrl: 'https://dev.api.example.com',
    apiToken: __ENV.DEV_TOKEN || '',
    timeout: '30s',
  },
  staging: {
    baseUrl: 'https://staging.api.example.com',
    apiToken: __ENV.STAGING_TOKEN || '',
    timeout: '30s',
  },
  prod: {
    baseUrl: 'https://api.example.com',
    apiToken: __ENV.PROD_TOKEN || '',
    timeout: '45s',
  },
};

// Select environment from __ENV, default to local
const selectedEnv = __ENV.ENVIRONMENT || 'local';
const config = environments[selectedEnv];

if (!config) {
  throw new Error(
    `Unknown environment: ${selectedEnv}. Available: ${Object.keys(environments).join(', ')}`
  );
}

// Adjust load based on environment
const stagesByEnv = {
  local: [
    { duration: '30s', target: 2 },
    { duration: '30s', target: 2 },
    { duration: '30s', target: 0 },
  ],
  dev: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 5 },
    { duration: '1m', target: 0 },
  ],
  staging: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 0 },
  ],
  prod: [
    { duration: '5m', target: 25 },
    { duration: '10m', target: 25 },
    { duration: '5m', target: 0 },
  ],
};

export const options = {
  stages: stagesByEnv[selectedEnv],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
  tags: {
    environment: selectedEnv,
  },
};

export default function multiEnvTest() {
  const params = {
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
      'X-Test-Environment': selectedEnv,
    },
    timeout: config.timeout,
    tags: {
      name: 'multi-env-request',
    },
  };

  const response = http.get(`${config.baseUrl}/api/health`, params);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'environment header present': (r) => r.headers['X-Environment-Name'],
  });

  console.log(`[${selectedEnv}] Status: ${response.status}`);

  sleep(1);
}
