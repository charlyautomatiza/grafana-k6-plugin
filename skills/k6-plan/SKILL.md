---
name: k6-plan
description: Plan deterministic k6 performance tests from goals, SLA, and protocol context. Use when users ask to plan a load test, set up a stress/spike/soak strategy, or request a full k6 test blueprint.
user-invocable: true
disable-model-invocation: false
license: MIT
metadata:
  version: 0.1.0
  category: performance-testing
  protocols: [http, grpc, browser]
---
- User says: "build a complete k6 test plan with SLA"

## Tool Discovery Protocol

At the beginning of the workflow, detect and use interaction tools in this order:

1. If `AskUserQuestion` exists, use it for required inputs.
2. Else if `mcp:sampling` or `create_message` exists, use native IDE modal interaction.
3. Else if `confirm_action` exists, use it for critical confirmations.
4. Else emit the exact fallback and end the turn:

```md
> [?] MISSING REQUIREMENT: [Missing target, scenario, or SLA detail]
```

Do not continue plan generation after fallback.

## Core Rules

<rules>
1. **Three-Question Protocol**: When critical parameters are missing, ask exactly three questions:
   - What is the target URL/endpoint? (if `target` missing)
   - What scenario type do you need? Options: load, stress, spike, soak, smoke (if `scenario` missing)
   - What are your SLA requirements? Example: p95<500ms,error<1% (if `sla` missing)

2. **Load Profile Defaults** (when `profile` is not specified):
   - `minimal`: 5 VUs, 1m duration, smoke testing
   - `standard`: 25 VUs, 9m duration, realistic load
   - `aggressive`: 120 VUs, 14m duration, stress testing

3. **Output Format**: Primary output is a textual execution plan with:
   - Recommended executor type
   - VU count and stages
   - Duration estimate
   - SLA-derived thresholds
   - Protocol-specific recommendations
   - Data integration suggestions (CSV/JSON)

4. **Script Generation** (optional): Only generate k6 script code when user explicitly requests `output=script` or clearly asks for executable code.

5. **Determinism**: Same inputs produce identical outputs every time.
</rules>

## Required k6 Invariants

Always enforce these validations before returning the plan:

1. **Thresholds are required**
   - Parse thresholds from SLA if provided.
   - If SLA is not provided, derive profile-based defaults and show them explicitly.
2. **Load profile is required**
   - Plan must include explicit VUs and duration (or explicit stage set with equivalent duration and target VUs).
   - If `vus`/`duration` are missing, derive from profile defaults and state assumptions.

## Scenario to Executor Mapping

<executor-logic>
- **load**: ramping-vus with gradual ramp-up/down
- **stress**: ramping-vus with aggressive progression beyond capacity
- **spike**: ramping-vus with rapid surge to peak
- **soak**: constant-vus or ramping-vus sustained for extended duration
- **smoke**: constant-vus with minimal load
</executor-logic>

## SLA Parsing Rules

<sla-rules>
Parse SLA string to extract threshold conditions. Supported syntax:

### Simple Conditions (single metric)
- `p95<Xms` → 95th percentile latency threshold
- `p99<Xms` → 99th percentile latency threshold
- `error<X%` or `rate<X%` → Error rate threshold

### Comma-Separated Lists (implicit AND)
- `p95<500ms,p99<900ms,error<1%` → All conditions must be met
- Commas separate independent thresholds
- All listed thresholds are combined in final configuration

### Explicit AND Conditions (multiple conditions on same metric)
- `p95<500ms AND p95>100ms` → p95 must be between 100ms and 500ms
- Multiple constraints on the same metric (range validation)
- Translates to multiple threshold entries for the same k6 metric

**Note:** OR logic is not supported in this version. All conditions are treated as mandatory (AND).

### Parsing Examples
- Input: `p95<400ms,error<1%` → p95 AND error rate thresholds
- Input: `p95<500ms AND p99<900ms` → Both percentiles required
- Input: `p95<2s` → Single threshold with p99 inferred (see sla-defaults.md)

Defaults per profile when SLA is not provided:
- `minimal`: p95<800ms, error<2%
- `standard`: p95<500ms, error<1%
- `aggressive`: p95<700ms, error<2%
</sla-rules>

## Protocol-Specific Generation

<protocol-patterns>
### HTTP
- Use `http.get()`, `http.post()`, `http.batch()` for parallel requests
- Metrics: `http_req_duration`, `http_req_failed`
- Always include timeout: `timeout: '30s'`
- Tag requests: `tags: { name: 'api-call' }`

### gRPC
- Use `grpc.Client()`, `client.load()`, `client.connect()`, `client.invoke()`
- Metrics: `grpc_req_duration`, `grpc_req_failed`
- Always close connections in teardown
- Handle metadata for authentication

### Browser
- Use `browser.newPage()`, `page.goto()`, `page.waitForSelector()`
- Always close page/context at iteration end
- Prefer `data-testid` selectors
- Collect Web Vitals when relevant
</protocol-patterns>

## Progressive Disclosure

Keep this file focused on core planning workflow. Place deep guidance in:

- `skills/k6-plan/references/README.md`

## Workflow

When user invokes this skill:

1. Parse provided parameters (`target`, `scenario`, `sla`, `profile`, `protocol`, `duration`, `vus`, `output`).
2. Run Tool Discovery Protocol when critical inputs are missing.
3. If `target`, `scenario`, or `sla` are missing, emit exactly three questions and wait for answers.
4. Apply load profile defaults based on `profile`.
5. Select executor based on scenario type.
6. Parse SLA thresholds or apply deterministic defaults.
7. Validate explicit or derived VUs and duration.
8. Generate textual plan with recommendations.
9. If `output=script` or user explicitly requests code, generate complete k6 JavaScript.
10. Return the plan and assumptions summary.
