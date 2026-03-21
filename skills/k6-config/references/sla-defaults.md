# SLA Defaults & Threshold Recommendations

## Default SLA by Profile

| Profile | p95 Latency | p99 Latency | Error Rate | Check Success |
|---------|-------------|-------------|------------|---------------|
| minimal | <800ms | <1440ms | <2% | >95% |
| standard | <500ms | <900ms | <1% | >95% |
| aggressive | <300ms | <700ms | <0.5% | >99% |

## Environment to Profile Mapping

When no explicit profile is specified, the following environment-to-profile mapping is used:

| Environment | Default Profile | Rationale |
|-------------|----------------|-----------|
| `dev`, `local` | minimal | Lower expectations for local development environments |
| `staging`, `qa`, `test` | standard | Representative of production expectations |
| `prod`, `production` | standard | Strictest default profile in this table for production workloads |

This mapping ensures consistent profile selection across different deployment contexts. Users can override by explicitly specifying a profile (e.g., `--profile=standard`).

## VU Capacity Boundaries

Load generator capacity varies by execution context. Recommended VU limits:

| Context | Recommended Max VUs | Rationale |
|---------|-------------------|-----------|
| Local (laptop/desktop) | 50-100 | Limited CPU/memory; avoid overwhelming local machine |
| CI/CD (standard runner) | 100-200 | Shared resources; keep tests fast and reliable |
| Cloud (dedicated instance) | 500-1000+ | Higher capacity; can scale with larger instance types |

**Behavior on Out-of-Range Values:**
- If user requests VUs exceeding context limits, the skill should:
  1. Issue a `WARNING` noting the potential resource constraint
  2. Suggest alternative: scale horizontally (multiple load generators) or use cloud execution
  3. Proceed with user-specified value (explicit override) unless it's clearly invalid (e.g., negative VUs)

**Example Warning:**
```
⚠️  WARNING: Requested 500 VUs exceeds recommended limit for local execution (50-100 VUs).
Consider running this test on a cloud load generator or reducing VU count to avoid resource exhaustion.
```

## Parsing Examples

### Input: `p95<400ms,p99<900ms,error<1%`
Output:
```javascript
{
  http_req_duration: ['p(95)<400', 'p(99)<900'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95']
}
```

### Input: `p95<2s` (with inference)
Output:
```javascript
{
  http_req_duration: ['p(95)<2000', 'p(99)<3600'],  // p99 = p95 * 1.8
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95']
}
```

### Input: `p95<500ms AND p99<900ms AND error<1%` (explicit AND)
Output:
```javascript
{
  http_req_duration: ['p(95)<500', 'p(99)<900'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95']
}
```

### Input: `p95<300ms AND p95>50ms` (range constraint)
Output:
```javascript
{
  http_req_duration: ['p(95)<300', 'p(95)>50'],  // Multiple conditions on same metric
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.95']
}
```

> **IMPORTANT: Note on p99 Inference:** The `p99 = p95 * 1.8` formula is an empirical heuristic based on common latency distributions. This is not an official k6 standard and must not be treated as universally valid.
>
> Use this approximation only as an initial baseline when real p99 measurements are unavailable. Replace it with measured p99 values from representative environments (staging or production-like) before final SLA sign-off.

## Protocol-Specific Metrics

### HTTP
- `http_req_duration` - Total request time
- `http_req_waiting` - Time to first byte
- `http_req_connecting` - TCP connection time
- `http_req_failed` - Requests marked as failed by k6 according to expected status criteria (by default, responses outside 2xx/3xx) and network/transport errors

### gRPC
- `grpc_req_duration` - Total RPC time
- `grpc_req_failed` - Failed RPCs

### Browser
- `browser_web_vital_fcp` - First Contentful Paint
- `browser_web_vital_lcp` - Largest Contentful Paint
- `browser_web_vital_cls` - Cumulative Layout Shift
