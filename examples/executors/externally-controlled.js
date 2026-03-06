// Executor: externally-controlled
// VU count and execution duration controlled via REST API
// Best for: Dynamic load testing with runtime control

// Prerequisites:
// 1. Start k6 with executorConfig.envVars = { K6_EXECUTOR: 'externally-controlled' }
// 2. This allows you to scale VUs and duration via REST API during test

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';
const k6ControlUrl = __ENV.K6_CONTROL_URL || 'http://localhost:6565';

export const options = {
  executor: 'externally-controlled',
  vus: 1,              // Start with 1 VU
  duration: '1h',      // Can run up to 1 hour
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function externallyControlledTest() {
  const response = http.get(`${baseUrl}/get`, {
    tags: { name: 'externally-controlled-request' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 500,
  });

  sleep(1);
}

/*
WHEN TO USE:
✅ Gradual load ramp from CI/CD - Scale VUs programmatically
✅ Live monitoring - Adjust load based on real-time metrics
✅ Adaptive testing - Change VUs based on system health
✅ Long-running tests - Adjust duration based on findings
✅ Multi-phase tests - Different load patterns in sequence

WHEN NOT TO USE:
❌ Simple tests - Use ramping-vus for standard ramp-ups
❌ Predetermined load - Use pre-configured executors
❌ Offline testing - Requires external control mechanism
❌ No external control system - Use other executors

CHARACTERISTICS:
• Dynamic: VUs and duration controlled at runtime
• REST API: Control via HTTP requests while test runs
• Flexible: Adjust test without restarting
• Complex: Requires orchestration/control logic

HOW IT WORKS:

1. Start k6 with externally-controlled:
   ```
   k6 run --execution-segment "0:1/1" \
          --execution-segment-duration "10h" \
          script.js
   ```

2. k6 exposes REST API endpoint (typically localhost:6565):
   
   GET http://localhost:6565/v1/status
   - Get current execution status
   
   PATCH http://localhost:6565/v1/status
   ```json
   {
     "vus": 50,
     "vusMax": 100,
     "pauseState": "running"
   }
   ```
   - Set VU count to 50
   - Allow up to 100 VUs
   - Set pause state (running/paused)

3. External controller monitors metrics and adjusts:
   ```bash
   # Scale to 50 VUs
   curl -X PATCH http://localhost:6565/v1/status \
        -H "Content-Type: application/json" \
        -d '{"vus": 50}'
   
   # Scale to 100 VUs
   curl -X PATCH http://localhost:6565/v1/status \
        -H "Content-Type: application/json" \
        -d '{"vus": 100}'
   
   # Pause test
   curl -X PATCH http://localhost:6565/v1/status \
        -H "Content-Type: application/json" \
        -d '{"pauseState": "paused"}'
   
   # Resume test
   curl -X PATCH http://localhost:6565/v1/status \
        -H "Content-Type: application/json" \
        -d '{"pauseState": "running"}'
   ```

EXAMPLE WORKFLOW:

Terminal 1 (Start k6):
```
k6 run --executor externally-controlled \
       --vus 1 --duration 1h \
       script.js
```

Terminal 2 (Control script):
```bash
#!/bin/bash
# Start at 1 VU, gradually increase by 10 every 30 seconds
for vu in 10 20 30 40 50; do
  echo "Scaling to $vu VUs..."
  curl -X PATCH http://localhost:6565/v1/status \
       -H "Content-Type: application/json" \
       -d "{\"vus\": $vu}"
  
  # Check system health/metrics
  # If degradation detected, stop scaling
  
  sleep 30
done
```

ADVANTAGES:
• Dynamic: Adjust load in real-time
• Adaptive: Respond to system behavior
• Long-duration: Can run indefinitely (until max duration)
• Intelligent: External controller can make smart decisions

DISADVANTAGES:
• Complex: Requires orchestration infrastructure
• External dependency: Needs control mechanism
• API knowledge: Must understand REST API
• Debugging: Harder to troubleshoot dynamic changes

API REFERENCE:
GET /v1/status
- status: "running" | "paused"
- vus: current VUs
- vusMax: maximum VUs
- started: ISO timestamp
- stopped: ISO timestamp

PATCH /v1/status
{
  "vus": number (0 to vusMax),
  "vusMax": number (new max VUs),
  "pauseState": "paused" | "running"
}

STATUS CODES:
- 200: Success
- 400: Bad request (invalid VU count or state)
- 404: Execution not found
*/
