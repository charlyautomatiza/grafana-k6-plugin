// Data-Driven Load Test with CSV
// Load user credentials from CSV file and test authentication
// Usage: k6 run --env DATA_FILE=users.csv csv-users.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';

const csvFilePath = __ENV.DATA_FILE || './data/users.csv';
const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

// Load CSV data using SharedArray to avoid memory duplication
// CSV format expected: username,password,email
const users = new SharedArray('users', function () {
  const fileContent = open(csvFilePath);
  const parsed = papaparse.parse(fileContent, { header: true });
  return parsed.data.filter(row => row.username); // Remove empty rows
});

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 VUs
    { duration: '3m', target: 10 },   // Stay at 10 VUs
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.95'],
  },
};

export default function csvDataDrivenLoadTest() {
  // Round-robin: Each VU gets assigned different users based on iteration
  const userIndex = __VU % users.length;
  const currentUser = users[userIndex];

  // Build login request with CSV data
  const payload = JSON.stringify({
    username: currentUser.username,
    password: currentUser.password,
    email: currentUser.email,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'login-csv-data' },
    timeout: '30s',
  };

  // Test authentication endpoint
  const response = http.post(`${baseUrl}/post`, payload, params);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'login accepted': (r) => r.body.includes(currentUser.username),
  });

  sleep(1);
}
