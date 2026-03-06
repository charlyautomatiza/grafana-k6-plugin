# Executor Selection Guide

This directory contains examples of all 7 executor types in k6. Choose the right executor based on your testing goals.

## Quick Comparison Table

| Executor | Control | Best For | Load Profile | Duration |
|----------|---------|----------|--------------|----------|
| **constant-vus** | VU count | Baseline testing | Fixed VUs | Time-based |
| **ramping-vus** | VU ramp | Realistic growth | Gradual increase | Time-based |
| **constant-arrival-rate** | Request rate | Throughput testing | Fixed req/s | Time-based |
| **ramping-arrival-rate** | Rate ramp | Progressive load | Increasing req/s | Time-based |
| **per-vu-iterations** | Work volume | Fixed work | Variable VUs | Iteration-based |
| **shared-iterations** | Work pool | Smoke tests | Minimal load | Iteration-based |
| **externally-controlled** | REST API | Dynamic scaling | Runtime control | API-based |

## Decision Tree: Which Executor to Use?

```
START: What do you want to control?
│
├─ VU Count (virtual users)?
│  │
│  ├─ Fixed VUs throughout test?
│  │  └─> [constant-vus] ✓ Baseline testing
│  │
│  └─ VUs change over time?
│     └─> [ramping-vus] ✓ Realistic load profiles
│
├─ Request Rate (req/s)?
│  │
│  ├─ Fixed rate throughout test?
│  │  └─> [constant-arrival-rate] ✓ Throughput validation
│  │
│  └─ Rate changes over time?
│     └─> [ramping-arrival-rate] ✓ Progressive load ramp
│
├─ Total Work (iterations)?
│  │
│  ├─ Each VU does same iterations?
│  │  └─> [per-vu-iterations] ✓ Predictable work
│  │
│  └─ VUs share iteration pool?
│     └─> [shared-iterations] ✓ Quick smoke tests
│
└─ Runtime Control (via REST API)?
   └─> [externally-controlled] ✓ Dynamic scaling
```

## Detailed Comparison

### ✅ constant-vus
**Usage Pattern:**
```javascript
executor: 'constant-vus',
vus: 10,
duration: '5m',
```

**Pros:**
- Simplest executor
- Predictable load
- Good for baseline

**Cons:**
- Not realistic (all users start/stop simultaneously)
- No ramp-up phase
- Users don't behave this way

**When to use:**
- Measuring capacity at specific VU level
- Baseline comparison testing
- Quick smoke test with known VUs
- Simple sanity checks

---

### ✅ ramping-vus
**Usage Pattern:**
```javascript
executor: 'ramping-vus',
stages: [
  { duration: '2m', target: 20 },
  { duration: '5m', target: 50 },
  { duration: '2m', target: 0 }
]
```

**Pros:**
- Most realistic (mirrors user arrival)
- Gradual load increase (safer)
- Multi-stage in one test
- Observable degradation

**Cons:**
- Duration depends on response times (not completely predictable)
- VU count varies (harder to control exactly)
- More complex configuration

**When to use:**
- Most realistic load testing scenario
- Finding breaking point progressively
- Multi-stage capacity testing
- Production simulations
- **RECOMMENDED for most use cases**

---

### ✅ constant-arrival-rate
**Usage Pattern:**
```javascript
executor: 'constant-arrival-rate',
rate: 100,        // 100 requests per second
duration: '5m',
maxVUs: 50,
```

**Pros:**
- Predictable throughput
- VUs auto-scale for consistency
- Fair load (time-independent)
- Good for SLA validation

**Cons:**
- VU count unpredictable
- Not realistic for user behavior
- Requires more VUs if slow responses

**When to use:**
- Testing specific throughput (e.g., "100 req/s")
- API rate limit validation
- SLA compliance verification
- Capacity planning with rate targets

---

### ✅ ramping-arrival-rate
**Usage Pattern:**
```javascript
executor: 'ramping-arrival-rate',
startRate: 10,
stages: [
  { duration: '2m', target: 100 },
  { duration: '5m', target: 100 },
]
```

**Pros:**
- Progressive rate increase (realistic)
- Observe degradation at each rate level
- Auto-scaling VUs
- Comprehensive multi-stage test

**Cons:**
- Complex VU auto-scaling
- VU count not directly controllable
- More resource-intensive

**When to use:**
- Progressive throughput testing
- Finding breakpoint by request rate
- Testing at specific rate SLAs
- Capacity planning with rate progression

---

### ✅ per-vu-iterations
**Usage Pattern:**
```javascript
executor: 'per-vu-iterations',
vus: 10,
iterations: 100,  // Each VU does 100 iterations
```

**Pros:**
- Predictable total work (10 VUs × 100 iter = 1000 req)
- Even VU distribution
- Known test volume
- Good for data processing

**Cons:**
- Duration unpredictable (depends on response time)
- Not time-based (requests per second unknown)
- Limited for long tests

**When to use:**
- Fixed test volume requirements
- Data processing with work units
- Batch testing (each VU processes fixed batch)
- Reproducible test loads
- When you know exactly how many requests to send

---

### ✅ shared-iterations
**Usage Pattern:**
```javascript
executor: 'shared-iterations',
vus: 5,
iterations: 100,  // 100 total iterations shared
```

**Pros:**
- Very fast (minimal load)
- Good for smoke tests
- Low resource usage
- Quick feedback loop

**Cons:**
- Load distribution unpredictable
- Not suitable for real performance testing
- Too minimal for stress tests
- VU load varies

**When to use:**
- Quick smoke tests (is system UP?)
- CI/CD health checks
- Development iteration (quick feedback)
- Early validation before full test
- When you have limited budget for iterations

---

### ✅ externally-controlled
**Usage Pattern:**
```javascript
executor: 'externally-controlled',
vus: 1,
duration: '1h',
```
Then control via REST API:
```bash
curl -X PATCH http://localhost:6565/v1/status \
     -d '{"vus": 50}'
```

**Pros:**
- Dynamic control (adjust during test)
- Intelligent scaling possible
- Long-running flexibility
- Can respond to metrics

**Cons:**
- Complex (requires control system)
- External dependency needed
- Harder to troubleshoot
- Not suitable for simple tests

**When to use:**
- CI/CD pipeline with gradual ramp-up script
- Real-time monitoring & adaptive scaling
- Long-running tests with adjustments
- Orchestrated multi-phase tests
- A/B testing different load profiles

---

## Decision Flowchart by Scenario

### Scenario: "I need to test if my API can handle 50 concurrent users"
```
Answer: constant-vus
└─ executor: 'constant-vus', vus: 50, duration: '5m'
```

### Scenario: "I need to find at what VU count the system breaks"
```
Answer: ramping-vus
└─ Start with 10, ramp to 100, observe where performance degrades
```

### Scenario: "I need to validate my API handles 500 requests per second"
```
Answer: constant-arrival-rate
└─ executor: 'constant-arrival-rate', rate: 500, duration: '5m'
```

### Scenario: "I need to gradually increase load and find breaking point"
```
Answer: ramping-arrival-rate
└─ Start 50 req/s, ramp to 500 req/s, observe degradation
```

### Scenario: "I have a dataset of 1000 records, 10 VUs process them equally"
```
Answer: per-vu-iterations
└─ vus: 10, iterations: 100 (10 × 100 = 1000 total)
```

### Scenario: "I just want a quick smoke test that runs in < 1 minute"
```
Answer: shared-iterations
└─ vus: 5, iterations: 50 (fast, minimal load)
```

### Scenario: "I want to scale VUs based on real-time CPU metrics"
```
Answer: externally-controlled
└─ Start test, control API scales VUs based on metrics
```

---

## File Structure

- `constant-vus.js` - ✅ See detailed example with comments
- `ramping-vus.js` - ✅ See detailed example (RECOMMENDED for production)
- `constant-arrival-rate.js` - ✅ See detailed example
- `ramping-arrival-rate.js` - ✅ See detailed example
- `per-vu-iterations.js` - ✅ See detailed example
- `shared-iterations.js` - ✅ See detailed example
- `externally-controlled.js` - ✅ See detailed example with API reference

---

## Tips & Best Practices

### 1. **Default to ramping-vus**
Most realistic and safe. Start here if unsure.

### 2. **Use tags to identify executor in results**
```javascript
export const options = {
  executor: 'constant-vus',
  tags: {
    executor: 'constant-vus',
    phase: 'baseline'
  }
};
```

### 3. **Combine multiple executors in one test**
```javascript
export const options = {
  scenarios: {
    warmup: {
      executor: 'ramping-vus',
      stages: [{ duration: '1m', target: 10 }],
      startTime: '0s',
    },
    sustained: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      startTime: '1m',
    },
    rampdown: {
      executor: 'ramping-vus',
      stages: [{ duration: '1m', target: 0 }],
      startTime: '6m',
    }
  }
};
```

### 4. **Monitor appropriate metrics for each executor**
- **VU-based:** Watch `http_req_duration`, `http_req_failed`
- **Rate-based:** Watch `http_req_duration`, `data_received`
- **Iteration-based:** Watch `iteration_duration`, completion time

---

## Common Mistakes

❌ **Using constant-vus for realistic testing**
→ Use `ramping-vus` instead (users arrive gradually)

❌ **Using shared-iterations for performance testing**
→ Use `per-vu-iterations` or `ramping-vus` (sufficient load)

❌ **Forgetting maxVUs with rate-based executors**
→ Always set `maxVUs` limit to prevent runaway VU creation

❌ **Not considering response time for time-based executors**
→ Duration depends on response time, prepare accordingly

❌ **Using externally-controlled without control script**
→ You need external mechanism to call REST API
