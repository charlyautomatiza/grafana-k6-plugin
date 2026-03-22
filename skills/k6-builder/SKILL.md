---
name: k6-builder
description: Build runnable k6 artifacts from a plan or direct requirements. Use when users ask to generate k6 scripts, choose/apply executors in runnable options, or create single/multi-environment configs. Prefer this skill for any implementation output request, even if the user also mentions "executor" or "config".
user-invocable: true
disable-model-invocation: false
license: MIT
metadata:
   version: 0.1.0
   category: performance-testing
   protocols: [http, grpc, browser]
---
- User says: "generate runnable k6 script for this endpoint"
- User says: "build dev/staging/prod config with thresholds"
- User says: "which executor should I use and give me final options"

## Mission

Generate runnable k6 artifacts safely and deterministically:
- script code
- scenario/options configuration
- single and multi-environment setup

Do not switch to planning-only discussion when user asked for implementation output.

## Tool Discovery Protocol

At the beginning of the workflow, detect and use interaction tools in this order:

1. If `AskUserQuestion` exists, use it for required inputs.
2. Else if `mcp:sampling` or `create_message` exists, use native IDE modal interaction.
3. Else if `confirm_action` exists, use it for critical confirmations.
4. Else emit the exact fallback and end the turn:

```md
> [?] MISSING REQUIREMENT: Missing build input for runnable artifacts
required: target, scenario type, SLA requirements, and protocol
why: deterministic generation cannot proceed safely without minimum build inputs
next_question: What target endpoint, scenario type, SLA, and protocol should this build use?
```

Do not continue generation after fallback.

## Interoperability Fallback Contract

When fallback is required, always use this portable payload shape:

```md
> [?] MISSING REQUIREMENT: <short missing requirement summary>
required: <comma-separated missing fields>
why: <why generation cannot continue deterministically>
next_question: <single question that unblocks next step>
```

Do not emit final artifact content after this fallback.

## Core Rules

<rules>
1. **Adaptive Question System**: When critical parameters are missing, start with baseline planning questions and continue in the same question flow with any additional required questions:
   - What is the target URL/endpoint? (if `target` missing)
   - What scenario type do you need? Options: load, stress, spike, soak, smoke (if `scenario` missing)
   - What are your SLA requirements? Example: p95<500ms,error<1% (if `sla` missing)
   - What protocol should this test use? Options: http, grpc, browser (if `protocol` missing)

   Round contract:
   - **Round 1**: one consolidated baseline question block with all minimum required questions.
   - **Round 2**: one optional tie-break block only when a critical ambiguity remains after Round 1.
   - If required inputs are still unresolved after Round 2, emit the interoperability fallback and end the turn.

   Additional questions must be integrated into the same question system, not handled as a separate side flow:
   - Add an HTTP method question when `protocol=http` and the method cannot be inferred safely.
   - Add one or more authentication questions when auth is required or unknown and executable output depends on it.
   - Add more questions only inside Round 1 or the single Round 2 tie-break block when other critical ambiguities or missing requirements are detected.
   - Do not finalize artifact generation until all required questions from this same system are resolved.

2. **Load Profile Defaults** (when `profile` is not specified):
   - `minimal`: 5 VUs, 1m duration, smoke testing
   - `standard`: 25 VUs, 9m duration, realistic load
   - `aggressive`: 120 VUs, 14m duration, stress testing

3. **Output Format**: Primary output is runnable artifacts with:
   - Recommended executor type
   - VU count and stages/options
   - Duration estimate
   - SLA-derived thresholds
   - Protocol-specific implementation notes
   - Data integration suggestions (CSV/JSON)
   - Exactly one deterministic `Next recommended step`

4. **Determinism**: Same inputs produce identical outputs every time.
</rules>

## Terminology Contract

- **Scenario type** means the test objective shape (`load`, `stress`, `spike`, `soak`, `smoke`).
- **Profile** means default intensity presets (`minimal`, `standard`, `aggressive`) used when explicit `vus`/`duration` are missing.
- **Round** means one consolidated question block in the adaptive question system; baseline questions are Round 1 and the optional tie-break is Round 2.
- Scenario type selects the executor strategy; profile sets default intensity values.

## HTTP Method Question

Before producing final HTTP artifacts, add the method question to the same active question system:

1. Confirm primary method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) when endpoint behavior depends on method.
2. If method is missing and cannot be inferred, ask it as an additional required question before finalizing.
3. Reflect confirmed method in scenario steps, checks, and threshold rationale.

## Auth Discovery Questions

Before finalizing artifact output, add auth questions to the same active question system:

1. Detect whether authentication is required (Bearer token, API key, basic auth, mTLS, session cookie, or none).
2. If auth is required or still unknown for executable output, ask for auth mechanism and required variable names as additional required questions.
3. Never hard-code credentials in examples or generated scripts.
4. Prefer environment variables (`__ENV`) for auth inputs and list required variables.

## Direct Invocation Behavior

If invoked without prior plan, the same Adaptive Question System above still applies.

Then:

1. Build a minimal internal plan
2. Expose assumptions
3. Generate runnable artifacts
4. Recommend optional `k6-validate` run

## Language Policy

1. If user language is explicit, answer in that language.
2. If language is not explicit, default to English.
3. Keep command names, k6 metric keys, and code identifiers in English.

## Required k6 Invariants

Always enforce these validations before returning output:

1. **Thresholds are required**
   - Parse from SLA when provided.
   - If SLA missing, derive deterministic defaults and state them.
2. **Load profile is required**
   - Include explicit `vus` and `duration`, or explicit staged/scenario equivalent.
3. **Parameter coherence is required**
   - Arrival-rate executors must satisfy `preAllocatedVUs <= maxVUs`.
   - Time-based executors require explicit duration.
   - Iteration-based executors require explicit `vus` and `iterations`.
4. **Secrets and runnable safety are required**
   - Never hard-code credentials/tokens.
   - Require environment variables (`__ENV`) for auth and base URL.
5. **Multi-environment coherence is required**
   - For `dev/staging/prod`, validate `dev <= staging <= prod` for VU progression.
   - Emit `WARNING` if user override violates progression without explicit justification.

## Builder Decision Rules

### Scenario to Executor Mapping

- `load`: `ramping-vus`
- `stress`: `ramping-vus` (aggressive progression)
- `spike`: `ramping-vus` (rapid surge)
- `soak`: `constant-vus` or `ramping-vus` sustained
- `smoke`: `constant-vus`

### Request-Rate Intent

If user explicitly requires rate control, prioritize:
- `constant-arrival-rate` for fixed RPS
- `ramping-arrival-rate` for changing RPS

### Iteration Intent

If user asks for exact iteration accounting:
- `per-vu-iterations` or `shared-iterations`

## SLA Parsing Rules

<sla-rules>
Parse SLA string to extract threshold conditions. Supported syntax:

### Simple Conditions (single metric)
- `p95<Xms` -> 95th percentile latency threshold
- `p99<Xms` -> 99th percentile latency threshold
- `error<X%` or `rate<X%` -> Error rate threshold

### Comma-Separated Lists (implicit AND)
- `p95<500ms,p99<900ms,error<1%` -> All conditions must be met
- Commas separate independent thresholds
- All listed thresholds are combined in final configuration

### Explicit AND Conditions (multiple conditions on same metric)
- `p95<500ms AND p95>100ms` -> p95 must be between 100ms and 500ms
- Multiple constraints on the same metric (range validation)
- Translates to multiple threshold entries for the same k6 metric

**Note:** OR logic is not supported in this skill behavior. All conditions are treated as mandatory (AND).

### Parsing Examples
- Input: `p95<400ms,error<1%` -> p95 AND error rate thresholds
- Input: `p95<500ms AND p99<900ms` -> Both percentiles required
- Input: `p95<2s` -> Single threshold with p99 inferred (see sla-defaults.md)

Defaults per profile when SLA is not provided:
- `minimal`: p95<800ms, error<2%
- `standard`: p95<500ms, error<1%
- `aggressive`: p95<300ms, p99<700ms, error<0.5%, checks>99%
</sla-rules>

## Protocol-Specific Generation

<protocol-patterns>
### HTTP
- Use `http.get()`, `http.post()`, `http.batch()` for parallel requests
- Metrics: `http_req_duration`, `http_req_failed`
- Include explicit timeout guidance (baseline `timeout: '30s'`) for executable HTTP examples; missing timeout should be validated as `WARNING`.
- Tag requests: `tags: { name: 'api-call' }`

### gRPC
- Use `grpc.Client()`, `client.load()`, `client.connect()`, `client.invoke()`
- Metrics: `grpc_req_duration`, `grpc_req_failed`
- Always close connections in teardown
- Handle metadata for authentication

### Browser
- Use `browser.newContext()`, `context.newPage()`, `page.goto()`, `page.waitForSelector()`
- Always close page/context at iteration end
- Prefer `data-testid` selectors
- Collect Web Vitals when relevant
</protocol-patterns>

## Dashboard Policy

Apply deterministic recommendation:

1. CI/headless: `K6_WEB_DASHBOARD=false`
2. Local browser troubleshooting: `K6_WEB_DASHBOARD=true`
3. Local non-browser: default `K6_WEB_DASHBOARD=false` unless explicit opt-in
4. Otherwise default `false`

## Output Contract

Every response must include these sections in order:

1. Build Inputs Summary
2. Internal Minimal Plan
3. Executor and Scenario Configuration
4. Runnable Artifacts
5. Thresholds
6. Environment Configuration (single or multi-env as requested)
7. Guardrail Validation
8. Assumptions
9. Next recommended step

## Runnable Artifact Rules

- Always prefer `__ENV.BASE_URL` for runnable scripts.
- Include timeout guidance for HTTP (`timeout: '30s'` baseline).
- Include checks and request tags for segmentation.
- For auth, list required env vars and never place secret literals.
- For multi-env requests, include `.env.example` placeholders only.

## Progressive Disclosure

Keep this file focused on generation workflow. Place deep guidance in:

- `skills/k6-builder/references/README.md`

## Workflow

1. Parse parameters (`target`, `scenario`, `sla`, `protocol`, `profile`, `duration`, `vus`, `environments`, `goal`).
2. Run Tool Discovery Protocol when minimum inputs are missing.
3. Start the Adaptive Question System with baseline questions when `target`, `scenario`, `sla`, or `protocol` are missing.
4. Add an HTTP method question to the same question system when protocol is HTTP and method is still ambiguous.
5. Add auth questions to the same question system when auth is required, unknown, or otherwise blocks executable output.
6. Add more questions in the same system if other critical ambiguities or missing requirements are detected.
7. Build internal minimal plan from inputs.
8. Select executor and derive coherent scenario config.
9. Parse SLA thresholds or apply deterministic defaults.
10. Generate runnable script/options/config outputs.
11. Apply dashboard and secrets safety policies.
12. Validate all required invariants.
13. Return output in Output Contract order.
