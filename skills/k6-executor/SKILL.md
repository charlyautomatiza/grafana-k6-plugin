---
name: k6-executor
description: Select the correct k6 executor from user goals and constraints. Use when users ask which executor to use, how to model load, or how to convert a test objective into a valid scenario setup.
user-invocable: true
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
> [?] MISSING REQUIREMENT: Missing goal or execution constraints
required: goal, load-shape constraint, and execution context
why: deterministic executor recommendation requires all three
next_question: What is your primary goal and is it rate-controlled or VU-controlled?
```

Do not continue recommendation after fallback.

## Interoperability Fallback Contract

When fallback is required, always use this portable payload shape:

```md
> [?] MISSING REQUIREMENT: <short missing requirement summary>
required: <comma-separated missing fields>
why: <why recommendation cannot continue deterministically>
next_question: <single question that unblocks next step>
```

Do not emit final recommendation content after this fallback.

## Language Policy

1. If user language is explicit, answer in that language.
2. If language is not explicit, default to English.
3. Keep command names, k6 metric keys, and code identifiers in English.

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
3. **Parameter coherence is required**
   - Arrival-rate executors must satisfy `preAllocatedVUs <= maxVUs`.
   - `duration` values must be explicit and valid for time-based executors.
  - `constant-vus` must include explicit `vus` and `duration`.
  - `ramping-vus` must include explicit `startVUs` and non-empty `stages`.
  - `ramping-arrival-rate` must include `startRate`, `timeUnit`, non-empty `stages`, and valid capacity controls.
  - `per-vu-iterations` and `shared-iterations` must include explicit `vus` and `iterations`.
   - `externally-controlled` recommendations must include execution-context assumptions.
4. **Secrets and runnable safety are required**
  - Never hard-code credentials or tokens in runnable snippets.
  - Require environment variables (`__ENV`) when auth or secrets are needed.

## Decision Tree

<decision-tree>
Round definition:

- **Round 1 (baseline block)**: ask the three baseline questions as one consolidated block.
- **Round 2 (tie-break only)**: ask at most one tie-break question if conflict remains.

Ask user the baseline questions if `goal` parameter is incomplete:

1. **Do you need to control VU count or request rate?**
   - VU count → constant-vus or ramping-vus
   - Request rate → constant-arrival-rate or ramping-arrival-rate

2. **Does load stay fixed or change over time?**
   - Fixed → constant-* executors
   - Changes → ramping-* executors

3. **Is duration time-based or iteration-based?**
   - Time-based → use duration parameter
   - Iteration-based → per-vu-iterations or shared-iterations

If user requirements conflict (for example strict RPS target and strict VU cap), ask one tie-break question in Round 2:

- "Which is more critical for this run: exact request-rate target or strict virtual-user ceiling?"
</decision-tree>

## Response Modes

- **Brief mode**: Return executor choice, minimal valid config, threshold summary, dashboard recommendation.
- **Detailed mode**: Include decision rationale, alternatives, guardrail validation table, and assumptions.
- Default to brief mode when user asks for a quick answer or the request is narrow and unambiguous.

## SLA Reconfirmation Rule

When user provides explicit SLA values (latency/error/check targets), do this before final recommendation:

1. Re-state parsed SLA values exactly.
2. Ask for confirmation once.
3. Apply confirmed values in thresholds.
4. If values are technically inconsistent, keep user-provided values and add a short improvement suggestion.

Do not silently replace explicit user SLAs with defaults.

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

## Web Dashboard Recommendation Gate

Apply this gate before final recommendation:

1. If scenario is CI/non-interactive, keep dashboard disabled by default (`K6_WEB_DASHBOARD=false`) and prefer exported summaries.
2. If scenario involves local interactive browser troubleshooting, recommend `K6_WEB_DASHBOARD=true`.
3. If scenario is local non-browser, default to disabled (`K6_WEB_DASHBOARD=false`) unless user explicitly asks for interactive monitoring.
4. For all other cases, default to disabled unless user explicitly asks for interactive local monitoring.
5. State one deterministic dashboard recommendation: `K6_WEB_DASHBOARD=true` or `K6_WEB_DASHBOARD=false` with rationale.

Always emit a visible section in output:

```md
## Web Dashboard Recommendation
K6_WEB_DASHBOARD=<true|false> - <short rationale>
```

This policy must remain aligned with `k6-config` dashboard controls.

## Output Contract

Every recommendation response must include these sections in order:

1. Executor Recommendation
2. Configuration (valid k6 options snippet)
3. Thresholds (confirmed or defaulted)
4. Guardrail Validation
5. Web Dashboard Recommendation
6. Next Step

Guardrail Validation must include executor-specific checks:

- `constant-vus`: explicit `vus` and `duration`
- `ramping-vus`: explicit `startVUs` and non-empty `stages`
- `constant-arrival-rate`: explicit `rate`, `timeUnit`, `duration`, and `preAllocatedVUs <= maxVUs`
- `ramping-arrival-rate`: explicit `startRate`, `timeUnit`, non-empty `stages`, and `preAllocatedVUs <= maxVUs`
- `per-vu-iterations`: explicit `vus` and `iterations`
- `shared-iterations`: explicit `vus` and `iterations`
- `externally-controlled`: explicit `vus`, `maxVUs`, `duration`, execution-context assumption, and documented control workflow

For arrival-rate executors, Guardrail Validation must also include:

- `preAllocatedVUs <= maxVUs` check
- explicit capacity assumption note

For `externally-controlled`, include one context assumption line:

- "Assumption: execution environment supports external control workflow for this scenario."

## Complete Configuration Example

The executor configurations shown above are **executor-only snippets**. A valid k6 options object must also include thresholds (per Required Invariants):

```javascript
export const options = {
  scenarios: {
    my_scenario: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
};
```

**Important:** Never provide executor configuration without corresponding threshold guidance. If user does not specify SLAs, include default thresholds explicitly.

## Progressive Disclosure

Keep this file focused on decision workflow. Place deep guidance in:

- `skills/k6-executor/references/README.md`

## Workflow

1. Parse user goal, constraints, and optional SLAs.
2. Select response mode (brief or detailed).
3. Run Tool Discovery Protocol if required inputs are missing.
4. If explicit SLAs are present, apply SLA Reconfirmation Rule.
5. If ambiguous or conflicting, run decision-tree rounds with the explicit contract (Round 1 baseline, Round 2 tie-break only).
6. Map answers to the most appropriate executor.
7. Validate thresholds, load-profile invariants, and parameter coherence.
8. Apply Web Dashboard Recommendation Gate and emit it visibly.
9. Provide deterministic configuration example following Output Contract.
10. Explain rationale and next step.
