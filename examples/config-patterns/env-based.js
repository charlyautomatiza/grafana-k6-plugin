// Environment-Based Configuration
// Uses __ENV to load configuration from environment variables
// Allows parameterization without hardcoded values

// Usage:
// k6 run --env BASE_URL=https://api.example.com env-based.js
// k6 run --env BASE_URL=https://api.example.com --env API_TOKEN=xyz123 env-based.js

import http from 'k6/http';
import { check, sleep } from 'k6';

// Load config from environment variables with sensible defaults
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const apiToken = __ENV.API_TOKEN || '';
const testUser = __ENV.TEST_USER || 'testuser@example.com';
const featureFlag = __ENV.FEATURE_ENABLED || 'false';

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '3m', target: 5 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function envBasedConfigTest() {
  const params = {
    headers: {
      'User-Agent': 'k6-test',
      'Content-Type': 'application/json',
    },
    timeout: '30s',
  };

  // Add authentication header if token provided
  if (apiToken) {
    params.headers['Authorization'] = `Bearer ${apiToken}`;
  }

  // Test 1: Get user info
  const userResponse = http.get(`${baseUrl}/api/user`, params);

  check(userResponse, {
    'user endpoint available': (r) => r.status === 200 || r.status === 401,
  });

  // Test 2: Conditional request based on feature flag
  if (featureFlag === 'true') {
    const featureResponse = http.get(`${baseUrl}/api/feature/new`, params);

    check(featureResponse, {
      'feature endpoint works': (r) => r.status === 200,
    });
  }

  // Tag requests with configuration for filtering in results
  const taggedParams = {
    ...params,
    tags: {
      name: 'api-call',
      environment: __ENV.ENVIRONMENT || 'unknown',
    },
  };

  const apiResponse = http.get(`${baseUrl}/api/data`, taggedParams);

  check(apiResponse, {
    'api endpoint responds': (r) => r.status < 500,
  });

  sleep(1);
}
