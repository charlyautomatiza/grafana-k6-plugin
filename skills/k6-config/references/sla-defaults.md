# SLA Defaults & Threshold Recommendations

## Default SLA by Profile

| Profile | p95 Latency | p99 Latency | Error Rate | Check Success |
|---------|-------------|-------------|------------|---------------|
| minimal | <800ms | <1440ms | <2% | >95% |
| standard | <500ms | <900ms | <1% | >95% |
| aggressive | <700ms | <1260ms | <2% | >90% |

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

## Protocol-Specific Metrics

### HTTP
- `http_req_duration` - Total request time
- `http_req_waiting` - Time to first byte
- `http_req_connecting` - TCP connection time
- `http_req_failed` - Failed requests (4xx, 5xx)

### gRPC
- `grpc_req_duration` - Total RPC time
- `grpc_req_failed` - Failed RPCs

### Browser
- `browser_web_vital_fcp` - First Contentful Paint
- `browser_web_vital_lcp` - Largest Contentful Paint
- `browser_web_vital_cls` - Cumulative Layout Shift
