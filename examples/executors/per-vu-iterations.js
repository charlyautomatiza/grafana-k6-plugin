// Executor: per-vu-iterations
// Each VU executes exactly N iterations
// Best for: Fixed total work distribution with predictable test volume

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

export const options = {
  executor: 'per-vu-iterations',
  vus: 10,            // 10 VUs in parallel
  iterations: 100,    // Each VU runs exactly 100 iterations
  // Total: 10 VUs × 100 iterations = 1000 total iterations/requests
  maxDuration: '5m',  // Timeout if not completed by this time
  thresholds: {
    'iteration_duration': ['p(95)<1000'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function perVuIterationsTest() {
  // This function runs 100 times per VU
  const iteration = __VU + ' iter ' + __ITER;

  const response = http.get(`${baseUrl}/get?id=${iteration}`, {
    tags: { name: 'per-vu-iteration' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'request successful': (r) => r.timings.duration < 500,
  });

  sleep(1);
}

/*
WHEN TO USE:
✅ Fixed test volume - Must complete exactly X requests
✅ Development/smoke tests - Quick validation with known volume
✅ Batch processing tests - Each VU processes fixed work unit
✅ Debugging - Reproduce exact number of requests
✅ Data processing - Each VU handles fixed dataset size
✅ Load testing with budget - Know total requests in advance

WHEN NOT TO USE:
❌ Time-based testing - use constant-vus with duration
❌ Rate-limited testing - use arrival-rate executors
❌ Long-running tests - maxDuration becomes blocker
❌ Variable load - use ramping executors

CHARACTERISTICS:
• Deterministic: Exact number of requests calculated upfront
• Distributed: Work distributed evenly across VUs
• Bounded: Test has maximum duration (maxDuration)
• Simple: Easy to predict total load

MATH:
Total Iterations = vus × iterations
Total Requests = vus × iterations × (requests per iteration)

EXAMPLE:
vus: 10
iterations: 100
Total: 10 × 100 = 1000 requests

VU Distribution:
- VU 1: 100 iterations
- VU 2: 100 iterations
- ... (all identical)
- VU 10: 100 iterations

TIMING:
- If each iteration takes 1s: 10 VUs × 100 iter / 10 parallel = ~100s total
- If each iteration takes 5s: 10 VUs × 100 iter / 10 parallel = ~500s total
- maxDuration = 5m = safety net (test fails if takes longer)

ADVANTAGES:
• Predictable: Know exactly how many requests will be sent
• Simple: Equal work distribution
• Bounded: Always completes (with maxDuration safety)
• Observable: Clear when all work is done

DISADVANTAGES:
• Not realistic: Real users don't stop after N requests
• Time uncertain: Duration depends on response times
• Limited load: Fixed volume means can't indefinitely test
*/
