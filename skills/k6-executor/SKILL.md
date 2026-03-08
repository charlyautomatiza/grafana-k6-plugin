---
name: k6-executor
description: Select the correct k6 executor from user goals and constraints. Use when users ask which executor to use, how to model load, or how to convert a test objective into a valid scenario setup.
user-invokable: true
disable-model-invocation: false
license: MIT
metadata:
  version: 0.1.0
  category: performance-testing
---
- User says: "convert this load goal into a k6 scenario"
- User says: "how do I model 500 rps in k6"

## Tool Discovery Protocol

At the beginning of the workflow, detect and use interaction tools in this order:

1. If `AskUserQuestion` exists, use it for required inputs.
2. Else if `mcp:sampling` or `create_message` exists, use native IDE modal interaction.
3. Else if `confirm_action` exists, use it for critical confirmations.
4. Else emit the exact fallback and end the turn:

```md
> [?] MISSING REQUIREMENT: [Missing goal or execution constraints]
```

Do not continue recommendation after fallback.

## Required k6 Invariants

Always enforce these validations before final recommendation:

1. **Thresholds are required**
   - Output must include threshold guidance (provided or derived).
   - If SLA is missing, return default threshold assumptions explicitly.
2. **Load profile is required**
   - Time-based executors must include explicit duration.
   - VU-based executors must include explicit VUs.
   - Arrival-rate executors must include capacity controls (`preAllocatedVUs`, `maxVUs`) and a duration.
   - Iteration-based executors must include explicit `vus` and `iterations`.

## Decision Tree

<decision-tree>
Ask user three clarifying questions if `goal` parameter is incomplete:

1. **Do you need to control VU count or request rate?**
   - VU count → constant-vus or ramping-vus
   - Request rate → constant-arrival-rate or ramping-arrival-rate

2. **Does load stay fixed or change over time?**
   - Fixed → constant-* executors
   - Changes → ramping-* executors

3. **Is duration time-based or iteration-based?**
   - Time-based → use duration parameter
   - Iteration-based → per-vu-iterations or shared-iterations
</decision-tree>

## Executor Recommendations

<executors>
### constant-vus
**When**: Fixed number of VUs for entire test duration  
**Example**: Baseline testing with 50 concurrent users  
**Config**:
```javascript
{
  executor: 'constant-vus',
  vus: 50,
  duration: '5m',
}
```

### ramping-vus
**When**: Gradually increase/decrease VU count  
**Example**: Simulate traffic growth, find breaking points  
**Config**:
```javascript
{
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
}
```

### constant-arrival-rate
**When**: Maintain fixed requests per second regardless of response time  
**Example**: Validate system can handle 500 RPS sustained  
**Config**:
```javascript
{
  executor: 'constant-arrival-rate',
  rate: 500,
  timeUnit: '1s',
  duration: '5m',
  preAllocatedVUs: 100,
  maxVUs: 200,
}
```

### ramping-arrival-rate
**When**: Gradually increase/decrease request rate  
**Example**: Progressive load testing with rate control  
**Config**:
```javascript
{
  executor: 'ramping-arrival-rate',
  startRate: 100,
  timeUnit: '1s',
  preAllocatedVUs: 100,
  stages: [
    { duration: '2m', target: 200 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },
  ],
  maxVUs: 300,
}
```

### per-vu-iterations
**When**: Each VU executes exactly N iterations  
**Example**: Data processing pipeline where each user processes 10 items  
**Config**:
```javascript
{
  executor: 'per-vu-iterations',
  vus: 20,
  iterations: 10,
}
```

### shared-iterations
**When**: Total iteration count distributed across all VUs  
**Example**: Quick smoke test with exactly 100 requests total  
**Config**:
```javascript
{
  executor: 'shared-iterations',
  vus: 10,
  iterations: 100,
}
```

### externally-controlled
**When**: Control test execution externally via k6 REST API  
**Example**: CI/CD integration with dynamic scaling  
**Config**:
```javascript
{
  executor: 'externally-controlled',
  vus: 10,
  maxVUs: 100,
  duration: '10m',
}
```
</executors>

## Progressive Disclosure

Keep this file focused on decision workflow. Place deep guidance in:

- `skills/k6-executor/references/README.md`

## Workflow

1. Parse user goal and constraints.
2. Run Tool Discovery Protocol if required inputs are missing.
3. If ambiguous, ask decision-tree questions.
4. Map answers to the most appropriate executor.
5. Validate threshold and load-profile invariants.
6. Provide a deterministic configuration example.
7. Explain rationale and next steps.
