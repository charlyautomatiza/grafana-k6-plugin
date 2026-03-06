// Executor: constant-arrival-rate
// Fixed number of requests per second (rate-limited)
// Best for: Testing systems with specific throughput requirements

import http from 'k6/http';
import { check } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

export const options = {
  executor: 'constant-arrival-rate',
  rate: 100,              // 100 requests per second
  timeUnit: '1s',         // Per second (also supports: 1m, 1h)
  duration: '5m',         // For 5 minutes
  preAllocatedVUs: 10,    // Start with 10 VUs, scale up if needed
  maxVUs: 100,            // But don't go above 100 VUs
  thresholds: {
    'http_req_duration': ['p(95)<300'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function constantArrivalRateTest() {
  const response = http.get(`${baseUrl}/get?timestamp=${Date.now()}`, {
    tags: { name: 'constant-rate-request' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response quality': (r) => r.timings.duration < 300,
  });

  // Note: No sleep() here for arrival-rate executor
  // The executor controls the rate, not think-time
}

/*
WHEN TO USE:
✅ API rate limit testing - "Can we handle 100 req/s?"
✅ SLA validation - "Must process 50+ requests per second"
✅ Throughput testing - "What's the max sustained requests/second?"
✅ Realistic scenarios - Users generate requests at fixed rate
✅ Load planning - Test specific throughput targets

WHEN NOT TO USE:
❌ Variable VU count important - use ramping-vus
❌ Burst/spike testing - use constant-vus instead
❌ Real user simulation - ramping-vus is more realistic

CHARACTERISTICS:
• Rate-based: Focuses on requests per second, not VU count
• Automatic scaling: VUs auto-scale to achieve target rate
• Predictable throughput: Exactly 100 req/s regardless of response time
• Efficient: Uses fewer VUs if they're fast enough

CONFIGURATION:
- rate: Number of requests (default: 1)
- timeUnit: frequency (default: '1s', can be '1m')
- preAllocatedVUs: Initial VUs to start with
- maxVUs: Maximum VUs allowed (safety limit)
- duration: How long to maintain rate

EXAMPLE:
rate=100, timeUnit='1s' → 100 requests per second
rate=6000, timeUnit='1m' → 6000 requests per minute (same as 100/sec)
rate=1, timeUnit='1s' → 1 request per second (slow load)

HOW IT WORKS:
1. k6 starts with preAllocatedVUs (e.g., 10)
2. If 10 VUs can't achieve rate (100 req/s), spawn more
3. If 10 VUs exceed rate, don't spawn more
4. Maintain exactly the target rate throughout duration

ADVANTAGES:
• Predictable: Know exact request rate
• Scalable: Automatically adjusts VU count
• Realistic: Users generate requests at constant rate
• Fair: Same load regardless of response time
*/
