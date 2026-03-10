# k6 Threshold Validation Rules

## Threshold Categories by Metric

### Response Time (Latency)
- **Metric:** `http_req_duration`, `grpc_req_duration`, `browser_web_vital_*`
- **Typical ranges:**
  - Aggressive SLA: p95 < 300ms
  - Standard SLA: p95 < 500ms
  - Lenient SLA: p95 < 1000ms
- **Validation rule:** p95 should be ≤ p99 and ≥ p50

| Profile | p50 (median) | p95 | p99 | p99.9 |
|---------|-----------|---|---|-------|
| Web API | 80ms | 200ms | 400ms | 800ms |
| Mobile API | 150ms | 400ms | 900ms | 1500ms |
| Browser | 200ms | 600ms | 1200ms | 3000ms |
| gRPC | 50ms | 150ms | 300ms | 600ms |

### Error Rates
- **Metric:** `http_req_failed`, `grpc_req_failed`, check failures
- **Typical ranges:**
  - Aggressive SLA: error rate < 0.5% (0.005)
  - Standard SLA: error rate < 1% (0.01)
  - Acceptable SLA: error rate < 5% (0.05)
- **Validation rule:** Error threshold should never be > 10% for load tests

### Success Rate / Check Pass Rate
- **Metric:** `checks`
- **Typical ranges:**
  - Aggressive SLA: > 99% (0.99)
  - Standard SLA: > 97% (0.97)
  - Minimum acceptable: > 95% (0.95)
- **Validation rule:** Should correlate with error rate (inverse relationship)

## Threshold Consistency Checks

### Check 1: Latency Ordering
```python
# p95 <= p99 <= p99.9
If p95_threshold > p99_threshold:
  Severity: ERROR
  Message: "p95 latency cannot exceed p99"
```

### Check 2: Error Rate Realism
```python
# If error_rate_threshold > 5%, flag as lenient
If error_rate_threshold > 0.05:
  Severity: WARNING
  Message: "Error rate threshold is over 5%; consider tightening for production"
```

### Check 3: Threshold Alignment with Scenario Type
```
Scenario: stress test
Expected error threshold: Higher (e.g., < 2–5%)
Actual: < 0.1%
Severity: WARNING
Message: "Stress test threshold may be too strict; consider p95<1000ms, error<5%"
```

### Check 4: Implicit Success Metrics
```python
# If checks exist but error threshold missing
If "checks" in thresholds and "http_req_failed" not in thresholds:
  Severity: WARNING
  Message: "Checks defined but no error rate threshold; consider adding error rate check"
```

## Example Validations

### Valid ✅
```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95'],
}
```

### Invalid ❌ (p95 > p99)
```javascript
thresholds: {
  http_req_duration: ['p(95)<1000', 'p(99)<500'],  // ERROR: ordering
}
```

### Invalid ❌ (missing error threshold)
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],  // WARNING: no error rate
}
```

### Invalid ❌ (thresholds too lenient for load test)
```javascript
thresholds: {
  http_req_duration: ['p(95)<3000'],  // WARNING: unusually high for load test
  http_req_failed: ['rate<0.1'],      // WARNING: 10% error rate
}
```

## Threshold Derivation Rules

When user doesn't specify thresholds, apply these defaults:

### For "load" scenario
```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<900'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95'],
}
```

### For "stress" scenario
```javascript
thresholds: {
  http_req_duration: ['p(95)<800', 'p(99)<1440'],  // relaxed
  http_req_failed: ['rate<0.05'],                   // more lenient
  checks: ['rate>0.90'],
}
```

### For "spike" scenario
```javascript
thresholds: {
  http_req_duration: ['p(95)<1000', 'p(99)<2000'],  // very relaxed
  http_req_failed: ['rate<0.10'],                    // less critical
  checks: ['rate>0.85'],
}
```

### For "soak" scenario
```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<900'],   // same as load
  http_req_failed: ['rate<0.01'],                   // strict (long duration)
  checks: ['rate>0.95'],
}
```

### For "smoke" scenario
```javascript
thresholds: {
  http_req_duration: ['p(95)<800'],                 // generous (quick test)
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95'],
}
```
