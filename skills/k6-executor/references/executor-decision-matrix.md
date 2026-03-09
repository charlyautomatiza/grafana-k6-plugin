# Executor Decision Matrix

## Quick Selector

| Goal | VU Control Needed? | Rate Control Needed? | Fixed Duration? | Recommended Executor |
|------|-------------------|-------------------|-----------------|----------------------|
| Smoke test (quick check) | No | No | Yes (1m) | constant-vus |
| Load test (realistic ramp) | Yes | No | Yes | ramping-vus |
| Stress test (find capacity) | Yes | No | Yes | ramping-vus |
| Spike test (sudden burst) | Yes | No | Yes | ramping-vus |
| Soak test (long duration) | Yes | No | Yes (extended) | constant-vus |
| Rate-based load | No | Yes | Yes | constant-arrival-rate |
| Rate-based ramp | No | Yes | Yes | ramping-arrival-rate |
| Fixed iterations | No | No | No | per-vu-iterations |
| External control | Variable | Variable | Variable | externally-controlled |

## Detailed Comparison

### constant-vus
- **When to use:** Simple load tests, sustained load, soak tests
- **Pros:** Simplest to understand, predictable VU count
- **Cons:** No ramp-up, immediate spike to target load
- **Min. config:** `vus`, `duration`
- **Example:**
  ```javascript
  vus: 50,
  duration: '10m',
  ```

### ramping-vus
- **When to use:** Most production test scenarios, realistic load progression
- **Pros:** Smooth ramp-up, flexible stages, realistic user arrival
- **Cons:** Requires stage planning
- **Min. config:** `stages` array with duration and target VUs
- **Example:**
  ```javascript
  stages: [
    { duration: '2m', target: 30 },  // ramp up
    { duration: '7m', target: 30 },  // sustain
    { duration: '1m', target: 0 },   // ramp down
  ],
  ```

### constant-arrival-rate
- **When to use:** HTTP/API tests where you want to control requests/sec, not VUs
- **Pros:** Precise rate control, auto-scales VUs, results are rate-independent
- **Cons:** More complex, requires rate target
- **Min. config:** `rate`, `timeUnit`, `duration`, `preAllocatedVUs`, `maxVUs`
- **Example:**
  ```javascript
  rate: 100,          // 100 requests
  timeUnit: '1s',     // per second
  duration: '5m',
  preAllocatedVUs: 10,
  maxVUs: 50,
  ```

### ramping-arrival-rate
- **When to use:** Rate-based tests with progressive load increase
- **Pros:** Controlled rate progression, auto-scales VUs
- **Cons:** Requires rate planning
- **Min. config:** `stages` array with rate and timeUnit
- **VU dimensioning formula:**
  ```
  required_vus = rate * expected_iteration_duration_seconds
  maxVUs = required_vus * 1.5  (recommended buffer for safety)
  ```
  - **Example:** If your target rate is 100 req/s and each iteration takes ~2s, then:
    - `required_vus = 100 * 2 = 200 VUs`
    - `maxVUs = 200 * 1.5 = 300 VUs` (30% safety buffer)
  - **Without buffer:** Underdimensioned VUs can cause queue buildup and misleading test results
- **Example:**
  ```javascript
  stages: [
    { duration: '2m', target: 50 },   // ramp to 50 req/s
    { duration: '5m', target: 100 },  // increase to 100 req/s
    { duration: '1m', target: 0 },    // ramp down
  ],
  timeUnit: '1s',
  preAllocatedVUs: 10,
  maxVUs: 100,
  ```

### per-vu-iterations
- **When to use:** Tests driven by iterations (e.g., 100 requests per VU), no duration limit
- **Pros:** Deterministic iteration count, good for API tests
- **Cons:** Hard to predict total duration
- **Min. config:** `vus`, `iterations`
- **Example:**
  ```javascript
  vus: 10,
  iterations: 100,  // 100 iterations per VU = 1000 total
  ```

### shared-iterations
- **When to use:** Fixed total iteration count across all VUs
- **Pros:** Deterministic total work
- **Cons:** Unpredictable per-VU load
- **Min. config:** `vus`, `iterations`
- **Example:**
  ```javascript
  vus: 10,
  iterations: 100,  // 100 total iterations distributed across 10 VUs
  ```

### externally-controlled
- **When to use:** External system or orchestrator manages load (e.g., CI/CD, cloud controller)
- **Pros:** Maximum flexibility, integration with orchestration
- **Cons:** Requires external coordination
- **Min. config:** Minimal — system controls via REST API
- **Example:**
  ```javascript
  // Usually no explicit config; controlled via API calls
  // POST /v1/status { vus: 50, vusMax: 100 }
  ```

## Common Anti-Patterns

### ❌ Using constant-vus for production load tests
**Issue:** Immediate spike to full load doesn't mimic real-world user arrival
**Fix:** Use `ramping-vus` with gradual ramp-up stages

### ❌ Using VU-based executor for rate-critical APIs
**Issue:** Results vary based on response time; hard to compare across runs
**Fix:** Use `constant-arrival-rate` or `ramping-arrival-rate` for HTTP APIs

### ❌ Not setting maxVUs for arrival-rate executors
**Issue:** VU pool can grow unbounded if response times degrade
**Fix:** Always set `maxVUs` to a safe upper limit (e.g., 2x preAllocatedVUs)

### ❌ Using high iteration count with small VU count
**Issue:** Very long test duration, reduced parallelism
**Fix:** Increase VUs or decrease iterations proportionally

## Capacity Guardrails

### For arrival-rate executors:

**Dimensioning Formula:**
```
required_vus = rate × expected_iteration_duration_seconds
```

**Example:** If you want 100 req/s and each request takes ~0.5s on average:
```
required_vus = 100 × 0.5 = 50 VUs
```

**Configuration Guidelines:**
- `preAllocatedVUs`: Set to `required_vus` (calculated above)
- `maxVUs`: Set to `2-3x required_vus` as a safety buffer for response time degradation
- If response time increases during the test, k6 will scale up VUs automatically (up to `maxVUs`)

**Warning:** If k6 continuously hits `maxVUs` limit, either:
1. Your system is degrading (response times increasing)
2. Your `maxVUs` is undersized for the target rate

### For VU-based executors:
- Typical peak: 100–500 VUs per load generator instance
- Monitor CPU/memory on load generator
- **Rule:** 1 GB RAM ≈ 50–100 VUs sustained

## Threshold Mapping by Executor

| Executor Type | Typical Threshold | Rationale |
|---------|-----------|-----------|
| constant-vus | p95<500ms, error<1% | Sustained load baseline |
| ramping-vus | p95<600ms, error<1% | Allows for ramp-up settling |
| arrival-rate | p95<400ms, error<0.1% | More critical for rate-based |
| stress | p95<1000ms, error<5% | Testing capacity limit |
| soak | p95<500ms, error<1% | Same as load (extended duration) |
