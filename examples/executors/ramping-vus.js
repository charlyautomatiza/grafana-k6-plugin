// Executor: ramping-vus
// Gradually increase/decrease Virtual Users over time
// Best for: Realistic load testing with gradual ramp-up and ramp-down

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

export const options = {
  executor: 'ramping-vus',
  stages: [
    { duration: '2m', target: 10 },   // Ramp up from 0 to 10 VUs over 2 minutes
    { duration: '5m', target: 10 },   // Stay at 10 VUs for 5 minutes (steady state)
    { duration: '2m', target: 20 },   // Ramp up to 20 VUs over 2 minutes
    { duration: '5m', target: 20 },   // Stay at 20 VUs for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down from 20 to 0 VUs over 2 minutes
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.95'],
  },
};

export default function rampingVUsTest() {
  const response = http.get(`${baseUrl}/get`, {
    tags: { name: 'ramping-request' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 500,
    'body has content': (r) => r.body.length > 0,
  });

  sleep(1);
}

/*
WHEN TO USE:
✅ Realistic load testing - mirrors real user behavior (gradual increase)
✅ Capacity testing - ramp up to find breaking point progressively
✅ Stress testing - ramp to extreme load and observe system behavior
✅ Multi-stage testing - test different VU levels in single run
✅ Most common use case - provides gradual insight into system behavior

WHEN NOT TO USE:
❌ Fixed load only - use constant-vus if VUs don't change
❌ Fixed request rate - use arrival-rate instead
❌ Spike testing - might want constant-vus with sudden jump instead

CHARACTERISTICS:
• Progressive: Load increases gradually (more realistic)
• Multi-stage: Can have multiple ramp phases in one test
• Observable: See how system degrades as load increases
• Insightful: Find performance issues at specific VU levels

EXAMPLE BREAKDOWN:
- 0-2min: 0→10 VUs (ramp up) = gradual connection increase
- 2-7min: 10 VUs (steady) = stable load phase
- 7-9min: 10→20 VUs (scale up) = additional load surge
- 9-14min: 20 VUs (sustained) = sustained high load
- 14-16min: 20→0 VUs (cool down) = graceful shutdown

ADVANTAGES:
• Realistic: Users don't all arrive at once
• Safe: Gradual increase allows system to adapt
• Observable: See performance at each VU level
• Comprehensive: Single test covers multiple scenarios
*/
