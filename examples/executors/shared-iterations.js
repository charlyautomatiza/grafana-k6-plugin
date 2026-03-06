// Executor: shared-iterations
// All VUs share a fixed pool of iterations
// Best for: Quick development/smoke tests with minimum load

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

export const options = {
  executor: 'shared-iterations',
  vus: 5,             // 5 VUs in parallel
  iterations: 100,    // 100 total iterations shared among all VUs
  // Total: 100 iterations / 5 VUs = ~20 iterations per VU
  maxDuration: '2m',  // Timeout if not completed within 2 minutes
  thresholds: {
    'iteration_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function sharedIterationsTest() {
  // Global counter across all VUs (not per-VU)
  // VU 1 might do iterations 0-30, VU 2 might do iterations 31-50, etc.

  const response = http.get(`${baseUrl}/get`, {
    tags: { name: 'shared-iteration' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time ok': (r) => r.timings.duration < 500,
  });

  sleep(0.5); // Shorter think time for quick test
}

/*
WHEN TO USE:
✅ Quick smoke tests - Validate system is UP
✅ Early feedback - Fast test with minimal load
✅ Development cycles - Quick feedback while coding
✅ CI/CD validation - Quick gate before full test suite
✅ Budget-limited tests - Fixed total requests (100) distributed

WHEN NOT TO USE:
❌ Stress testing - Need sustained high load
❌ Capacity planning - Need more realistic load profiles
❌ Production validation - Use ramping-vus or sustained load
❌ Performance trending - Need consistent, repeatable test

CHARACTERISTICS:
• Shared pool: Iterations are divided among VUs dynamically
• Fast: Small iteration count = quick test execution
• Minimal: Lowest load option for quick validation
• Unpredictable: VU-to-iteration distribution not guaranteed

MATH:
Total Iterations = 100
VUs = 5
Expected per VU = 100 / 5 = 20 iterations (approximately)

Actual Distribution (may be uneven):
- VU 1: may do 19 iterations
- VU 2: may do 21 iterations
- VU 3: may do 20 iterations
- VU 4: may do 20 iterations
- VU 5: may do 20 iterations

TIMING EXAMPLE (each iteration = 1 second):
- With 5 VUs running in parallel
- 100 iterations / 5 VUs = ~20 per VU
- 20 iterations × 1s per iteration = ~20 seconds total

ADVANTAGES:
• Fast: Completed quickly (1-2 minutes typical)
• Low load: Minimal impact on system
• Simple: Easy to understand
• Useful for CI/CD: Quick health check

DISADVANTAGES:
• Uneven distribution: VU load not guaranteed equal
• Not realistic: Too little load for real testing
• Time dependent: Duration varies with response times
• Limited insights: No real performance data gathered

TYPICAL USE CASE:
```bash
# Quick smoke test in CI/CD pipeline
k6 run --executor shared-iterations \
       --vus 5 --iterations 50 \
       smoke-test.js
```

COMPARISON WITH per-vu-iterations:
┌─────────────────┬────────────────────┬─────────────────┐
│ Feature         │ shared-iterations  │ per-vu-iter     │
├─────────────────┼────────────────────┼─────────────────┤
│ Distribution    │ Dynamic/shared     │ Equal per VU    │
│ Predictability  │ Unpredictable      │ Predictable     │
│ Use case        │ Quick smoke test   │ Fixed load test │
│ Load per VU     │ Variable           │ Fixed           │
│ Typical duration│ < 1 minute         │ 1-5 minutes     │
└─────────────────┴────────────────────┴─────────────────┘
*/
