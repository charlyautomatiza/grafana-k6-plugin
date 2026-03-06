// Executor: constant-vus
// Fixed number of Virtual Users (VUs) for entire test duration
// Best for: Consistent load testing with predictable VU count

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

export const options = {
  executor: 'constant-vus',
  vus: 10,           // Exactly 10 VUs running in parallel
  duration: '5m',    // For 5 minutes
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function constantVUsTest() {
  const response = http.get(`${baseUrl}/get`, {
    tags: { name: 'constant-vus-request' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time ok': (r) => r.timings.duration < 500,
  });

  sleep(1);
}

/* 
WHEN TO USE:
✅ Standard load testing - you know exactly how many concurrent users
✅ Capacity planning - testing with fixed load to find breaking point
✅ Baseline testing - establishing performance baseline with consistent VUs
✅ Simple smoke tests - just validate the system works

WHEN NOT TO USE:
❌ Ramp-up testing - use ramping-vus instead
❌ Rate-limited systems - use arrival-rate instead
❌ Progressive load testing - use ramping-vus for gradual increase

CHARACTERISTICS:
• Predictable: Always 10 VUs from start to finish
• Simple: Easiest executor to understand and use
• Stable: Good for consistent, steady-state load
• Not realistic: Real users don't all start/stop simultaneously

EXAMPLE OUTPUT:
- 10 VUs × 300s = ~3000 requests (depending on think time)
- Provides good baseline for system capacity
- All VUs active immediately (no ramp-up)
*/
