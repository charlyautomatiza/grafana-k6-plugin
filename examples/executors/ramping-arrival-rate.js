// Executor: ramping-arrival-rate
// Gradually increase/decrease request rate over time
// Best for: Progressive throughput testing and load ramps

import http from 'k6/http';
import { check } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

export const options = {
  executor: 'ramping-arrival-rate',
  startRate: 10,           // Start at 10 requests/second
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 req/s over 2 minutes
    { duration: '5m', target: 50 },   // Maintain 50 req/s for 5 minutes
    { duration: '2m', target: 100 },  // Ramp up to 100 req/s over 2 minutes
    { duration: '5m', target: 100 },  // Maintain 100 req/s for 5 minutes
    { duration: '2m', target: 10 },   // Ramp down to 10 req/s over 2 minutes
  ],
  timeUnit: '1s',           // Per second
  preAllocatedVUs: 10,      // Start with 10 VUs
  maxVUs: 200,              // Allow scaling up to 200 VUs if needed
  thresholds: {
    'http_req_duration': ['p(95)<400'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function rampingArrivalRateTest() {
  const response = http.get(`${baseUrl}/get?time=${Date.now()}`, {
    tags: { name: 'ramping-rate-request' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  // No sleep() - rate executor controls pacing
}

/*
WHEN TO USE:
✅ Progressive throughput testing - gradually increase request rate
✅ Concurrency capacity planning - test at increasing throughput levels
✅ Multi-stage load tests - different rate levels in same run
✅ Realistic user growth - simulate traffic increase over time
✅ Finding breaking point - progressively increase to failure point

WHEN NOT TO USE:
❌ Fixed VU count important - use ramping-vus
❌ Simple constant load - use constant-arrival-rate
❌ Spike/burst testing - use constant-vus with stepwise increase

CHARACTERISTICS:
• Rate-based progression: Request rate changes over time
• Automatic VU scaling: Scales VUs to achieve target rate
• Multi-stage: Multiple rate phases in single test
• Observable degradation: See performance at each rate level

CONFIGURATION:
- startRate: Initial requests per second
- stages: Array of rate targets with duration
- timeUnit: '1s' (per second), '1m' (per minute), '1h' (per hour)
- preAllocatedVUs: Initial VU pool size
- maxVUs: Maximum allowed VUs (safety limit)

EXAMPLE BREAKDOWN:
- 0-2min: 10→50 req/s (ramp up gradually)
- 2-7min: 50 req/s (steady-state load)
- 7-9min: 50→100 req/s (increase load)
- 9-14min: 100 req/s (high load sustained)
- 14-16min: 100→10 req/s (cool down)

TOTAL REQUESTS:
- Ramp 1 (2min): ~60 req/s average = 7200 requests
- Steady 1 (5min): 50 req/s = 15000 requests
- Ramp 2 (2min): ~75 req/s average = 9000 requests
- Steady 2 (5min): 100 req/s = 30000 requests
- Ramp down (2min): ~55 req/s average = 6600 requests
- TOTAL: ~67,800 requests

ADVANTAGES:
• Progressive insight: See system performance at each rate
• Safe scaling: Gradual increase prevents overload
• Comprehensive: Single test covers multiple throughput levels
• Observable: Clear performance degradation path
• Realistic: Mirrors real traffic growth patterns
*/
