# k6 Load Profile Validation Rules

## Load Profile Components

Every k6 test must specify **at least one** of:

1. **Duration-based:** `vus` + `duration`
2. **Stages-based:** `stages` array (each stage has duration and target VUs)
3. **Iteration-based:** `vus` + `iterations`
4. **Executor-specific:** `preAllocatedVUs` + `maxVUs` + `rate` + `duration` (for arrival-rate)

## Validation Rules

### Rule 1: Load Profile Must Be Present
```javascript
// ❌ ERROR
export const options = {
  thresholds: { },
};

// ✅ FIXED
export const options = {
  vus: 10,
  duration: '5m',
  thresholds: { },
};
```

### Rule 2: Duration XOR Iterations
```javascript
// ❌ ERROR: Both specified (ambiguous behavior)
export const options = {
  vus: 10,
  duration: '5m',
  iterations: 100,  // conflicting
};

// ✅ FIXED: Choose one
// Option A: Duration
export const options = {
  vus: 10,
  duration: '5m',
};

// Option B: Iterations
export const options = {
  vus: 10,
  iterations: 100,
};
```

### Rule 3: Stages Must Have Valid Structure
```javascript
// ❌ ERROR: Stages missing target
export const options = {
  stages: [
    { duration: '1m' },  // target missing
  ],
};

// ✅ FIXED
export const options = {
  stages: [
    { duration: '1m', target: 10 },
  ],
};
```

### Rule 4: Arrival-Rate Requires Capacity Guards
```javascript
// ❌ ERROR: maxVUs not specified
export const options = {
  executor: 'constant-arrival-rate',
  rate: 100,
  timeUnit: '1s',
  duration: '5m',
  preAllocatedVUs: 10,
  // maxVUs missing!
};

// ✅ FIXED
export const options = {
  executor: 'constant-arrival-rate',
  rate: 100,
  timeUnit: '1s',
  duration: '5m',
  preAllocatedVUs: 10,
  maxVUs: 100,  // capacity guard
};
```

### Rule 5: VU Count Realism
```javascript
// ⚠️ WARNING: Very high VU count
export const options = {
  vus: 5000,      // WARNING: unlikely to run stably
  duration: '5m',
};

// ℹ️ Suggestion
// Validate load generator has sufficient resources (CPU, memory)
// Consider distributed load (multiple generators)
```

### Rule 6: Duration Realism
```javascript
// ℹ️ INFO: Very long test
export const options = {
  vus: 10,
  duration: '10h',  // Is this a soak test? Document intent
};

// Suggested comment
export const options = {
  // Soak test: sustained load over long period to find memory leaks
  vus: 10,
  duration: '10h',
};
```

## Scenario-to-Profile Mapping

| Scenario | Recommended Profile | VU Range | Duration | Executor |
|----------|-------------------|----------|----------|----------|
| smoke | minimal | 5 | 1m | constant-vus |
| load | standard | 10–50 | 5–15m | ramping-vus |
| stress | aggressive | 50–200 | 10–20m | ramping-vus |
| spike | aggressive | 200+ (sudden) | 5–10m | ramping-vus |
| soak | standard | 10–30 | 1–6h | constant-vus |
| rate-based | N/A (rate-driven) | Auto-scale | 5–15m | constant-arrival-rate |

## Stage Pattern Validation

### Valid Stage Pattern ✅
```javascript
stages: [
  { duration: '2m', target: 5 },    // ramp-up to 5 VUs
  { duration: '1m', target: 10 },   // ramp to 10 VUs
  { duration: '5m', target: 10 },   // sustain 10 VUs
  { duration: '2m', target: 0 },    // ramp-down to 0 VUs
]
// Total duration: 10m
```

### Invalid Stage Pattern ❌
```javascript
stages: [
  { duration: '2m', target: 5 },
  { duration: '1m', target: 2 },    // WARNING: decrease mid-test (odd)
  { duration: '5m', target: 10 },   // spike up again (ambiguous intent)
]
```

### Validation Output
```
⚠️ WARNING: Irregular VU progression
  Stage 2–3: VU count decreases then increases
  Expected: Monotonic progression (up or down)
  Suggestion: Clarify if this is intentional (e.g., cascading overload) or simplify to standard pattern
```

## Executor-Specific Validation

### constant-vus
- **Required:** `vus`, `duration`
- **Optional:** `iterations` (use `duration` instead)

### ramping-vus
- **Required:** `stages` (each with duration and target)
- **Optional:** `startVUs` (default: 0)

### constant-arrival-rate
- **Required:** `rate`, `timeUnit`, `duration`, `preAllocatedVUs`, `maxVUs`
- **Validation:** `preAllocatedVUs ≤ maxVUs`

### ramping-arrival-rate
- **Required:** `stages` (each with rate and target), `timeUnit`, `preAllocatedVUs`, `maxVUs`
- **Validation:** `preAllocatedVUs ≤ maxVUs`

### per-vu-iterations
- **Required:** `vus`, `iterations`
- **Optional:** `maxDuration` (timeout per VU)

### shared-iterations
- **Required:** `vus`, `iterations`
- **Behavior:** Iterations split across VUs

### externally-controlled
- **Required:** None (controlled via k6 REST API)
- **Typical:** REST calls to set VUs and runState

## Edge Cases

### Edge Case 1: Zero VU Test
```javascript
// ❌ ERROR: 0 VUs cannot execute
export const options = {
  vus: 0,
  duration: '5m',
};

// ✅ FIXED
export const options = {
  vus: 1,  // minimum 1
  duration: '5m',
};
```

### Edge Case 2: Very Short Duration
```javascript
// ⚠️ WARNING: Duration < 10s
export const options = {
  vus: 10,
  duration: '2s',  // too short for meaningful results
};

// Suggestion
export const options = {
  vus: 10,
  duration: '1m',  // minimum 1 minute recommended
};
```

### Edge Case 3: Arrival-Rate with Unachievable Target
```javascript
// ⚠️ WARNING: Rate too high for preAllocatedVUs
export const options = {
  executor: 'constant-arrival-rate',
  rate: 1000,        // 1000 req/s
  timeUnit: '1s',
  preAllocatedVUs: 5,  // likely insufficient!
  maxVUs: 20,
};

// Calculation: 1000 req/s ÷ 5 VUs = 200 req/vuper second
// Typical VU capacity: ~50–100 req/s, so 5 VUs can support ~250–500 req/s total
// Suggestion: Increase preAllocatedVUs and maxVUs
export const options = {
  executor: 'constant-arrival-rate',
  rate: 1000,
  timeUnit: '1s',
  preAllocatedVUs: 20,  // 20–50 req/s per VU = ~1000 req/s total
  maxVUs: 100,
};
```
