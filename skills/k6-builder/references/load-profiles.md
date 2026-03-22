# k6 Load Profiles Reference

## Profile Definitions

| Profile | VUs | Duration | Stages | Use Case |
|---------|-----|----------|--------|----------|
| minimal | 5 | 1m | Simple ramp | Quick smoke test |
| standard | 25 | 9m | Gradual ramp, sustain, ramp-down | Realistic load validation |
| aggressive | 120 | 14m | Rapid ramp to high load | Stress/capacity testing |

## Standard Stage Patterns

### Minimal
```javascript
stages: [
  { duration: '20s', target: 3 },
  { duration: '20s', target: 5 },
  { duration: '20s', target: 0 },
]
```

### Standard
```javascript
stages: [
  { duration: '2m', target: 15 },
  { duration: '5m', target: 25 },
  { duration: '2m', target: 0 },
]
```

### Aggressive
```javascript
stages: [
  { duration: '3m', target: 80 },
  { duration: '8m', target: 120 },
  { duration: '3m', target: 0 },
]
```

## Scenario Type Mapping

| Scenario | Recommended Executor | Profile Adjustment |
|----------|---------------------|-------------------|
| load | ramping-vus | Standard progression |
| stress | ramping-vus | Aggressive + overshoot |
| spike | ramping-vus | Rapid surge to peak |
| soak | constant-vus | Extended duration |
| smoke | constant-vus | Minimal VUs |
