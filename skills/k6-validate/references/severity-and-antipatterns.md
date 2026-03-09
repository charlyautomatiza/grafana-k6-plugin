# k6-validate Severity Model

## Classification Levels

### ❌ ERROR — Blocks validation, test cannot run reliably
- **Impact:** Script is fundamentally broken or violates load test best practices
- **Action:** Must fix before test execution
- **Examples:** Missing thresholds, malformed config, undefined VUs/duration

### ⚠️ WARNING — Does not block, but indicates risk or inconsistency
- **Impact:** Test might run, but results could be unreliable or misleading
- **Action:** Recommended to address before production
- **Examples:** High error rates, no checks defined, deprecated syntax

### ℹ️ INFO — Informational, suggests improvement
- **Impact:** Test is valid, but could be optimized or clarified
- **Action:** Nice-to-have; not required
- **Examples:** Missing tags, no comments, implicit assumptions

## Validation Rules by Category

### Thresholds

| Scenario | Rule | Severity | Fix |
|----------|------|----------|-----|
| No thresholds defined | ERROR | MUST have at least one threshold | Add threshold (e.g., `p95<500`) |
| Only success checks, no metrics | WARNING | Thresholds define success criteria (MOS - Measure of Success), not just checks | Add latency/availability thresholds |
| Inconsistent across environments | WARNING | Same test, different thresholds per env | Document environment-specific SLAs |
| p95 > p99 | ERROR | Invalid percentile relationship (p95 must be ≤ p99) | Swap values or fix percentile order |
| Error threshold > 5% | WARNING | Too lenient for most SLAs | Tighten error rate threshold |

### Load Profile

| Scenario | Rule | Severity | Fix |
|----------|------|----------|-----|
| No VUs and no duration | ERROR | Cannot determine test scope | Specify `vus` + `duration` OR `stages` |
| VUs defined, no duration | ERROR | Open-ended test, unclear exit | Add `duration` or `iterations` |
| Stages defined, no executor | WARNING | Stages imply ramping, but executor unclear | Use `ramping-vus` or `ramping-arrival-rate` |
| Very high VU count (>1000) | WARNING | May exceed load generator capacity | Validate load generator resources |
| Very long duration (>1h) | INFO | Consider soak test vs full-load profile | Clarify test objective |

### Protocol-Specific

#### HTTP
| Scenario | Rule | Severity | Fix |
|----------|------|----------|-----|
| All GET requests only | INFO | Limited coverage for stateful APIs | Add POST/PUT/DELETE if applicable |
| No authentication headers | WARNING | May not test realistic auth flow | Add bearer tokens or API keys |
| Batch size > 10 | WARNING | Batch requests might mask individual failures | Reduce batch size or use separate calls |
| No timeout defined | WARNING | Requests might hang indefinitely | Set `timeout: '30s'` or similar |

#### gRPC
| Scenario | Rule | Severity | Fix |
|----------|------|----------|-----|
| No TLS/plaintext override | WARNING | Should use TLS in production | Set `plaintext: false` |
| No metadata (auth) | WARNING | Real gRPC calls need authentication | Add metadata with tokens |
| Service definition not loaded | ERROR | Cannot invoke service without proto | Call `client.load()` first |

#### Browser
| Scenario | Rule | Severity | Fix |
|----------|------|----------|-----|
| No wait-for-selector before action | WARNING | Race condition: element might not exist | Add `waitForSelector()` before fill/click |
| No error handling (try-finally) | WARNING | Browser instance might leak | Wrap in try-finally with cleanup |
| High number of serial actions | WARNING | Slow test execution (not parallel) | Group or batch operations |

### Anti-Patterns

| Anti-Pattern | Severity | Why | Fix |
|---|---|---|---|
| Hardcoded credentials in script | ERROR | Security risk, fails in CI/CD | Use `__ENV` variables |
| Random think times with no control | WARNING | Unpredictable test duration | Use fixed `sleep()` or scenario-driven think times |
| Shared data without `SharedArray` | WARNING | Race condition in concurrent VUs | Wrap data in `SharedArray` |
| No tags on requests | INFO | Harder to analyze results | Add `tags: { name: 'request-name' }` |
| Check without named result | WARNING | Unclear what passed/failed | Always include descriptive check names |
| Threshold on aggregated metric only | WARNING | Cannot identify which scenario failed | Use per-scenario thresholds when needed |

## Remediation Examples

### Example 1: Missing thresholds
```javascript
// ❌ ERROR: No thresholds
export const options = {
  vus: 10,
  duration: '1m',
};
```

```javascript
// ✅ FIXED
export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
};
```

### Example 2: Race condition in browser test

**❌ WARNING: No wait before fill**
```javascript
await page.fill('[data-testid="username"]', 'user');
```

**✅ FIXED**
```javascript
await page.waitForSelector('[data-testid="username"]');
await page.fill('[data-testid="username"]', 'user');
```

### Example 3: Hardcoded credentials
```javascript
// ❌ ERROR: Security risk
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

```javascript
// ✅ FIXED
const token = __ENV.API_TOKEN;
if (!token) {
  throw new Error('API_TOKEN environment variable is required');
}
```

### Example 4: Executor mismatch with profile
```javascript
// ❌ WARNING: Stages defined but executor not specified (ambiguous)
export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '1m', target: 0 },
  ],
};
```

```javascript
// ✅ FIXED
export const options = {
  scenarios: {
    main: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '1m', target: 0 },
      ],
    },
  },
};
```
