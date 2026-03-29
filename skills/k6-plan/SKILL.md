---
name: k6-plan
description: Plan deterministic k6 performance tests from goals, SLA, and protocol context. Use when users ask to plan a load test, set up a stress/spike/soak strategy, or request a full k6 test blueprint. Route implementation output requests to k6-builder.
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
> [?] MISSING REQUIREMENT: Missing target, scenario, SLA, or protocol detail
missing: target, scenario type, SLA requirements, protocol
why: deterministic planning cannot proceed without baseline planning inputs
next_question: What target URL or endpoint should this plan use?
```

Do not continue plan generation after fallback.

## Interoperability Fallback Contract

When fallback is required, always use this portable payload shape:

```md
> [?] MISSING REQUIREMENT: <short missing requirement summary>
missing: <comma-separated missing fields>
why: <why plan generation cannot continue deterministically>
next_question: <single, specific question that unblocks the next step>
```

Do not emit final plan content after this fallback.

## Core Rules

<rules>
1. **Adaptive Question System**: When critical parameters are missing, start with the baseline planning questions and continue in the same question flow with any additional required questions:
   - What is the target URL/endpoint? (if `target` missing)
   - What scenario type do you need? Options: load, stress, spike, soak, smoke (if `scenario` missing)
   - What are your SLA requirements? Example: p95<500ms,error<1% (if `sla` missing)
   - What protocol should this test use? Options: http, grpc, browser (if `protocol` missing)
   
   **Edge case hardening**: When user input is ambiguous or conflicts with best practices:
   - If SLA thresholds conflict (e.g., "p95<100ms" for a high-latency service), ask clarification.
   - If scenario and SLA are mismatched (e.g., "smoke test with SLA p99<50ms"), flag and ask confirmation.
   - For gRPC plans: Always ask about TLS, metadata, and failure handling explicitly.

   Round contract:
   - **Round 1**: one consolidated baseline question block with all minimum required questions.
   - **Round 2**: one optional tie-break block only when a critical ambiguity remains after Round 1.
   - If required inputs are still unresolved after Round 2, emit the interoperability fallback and end the turn.

   **Provisional plan policy:**
   - If `target` or `sla` is missing but the scenario type is clear (e.g., stress test with explicit VU target), generate a provisional plan with `[assumption-based]` annotations for all missing values.
   - A provisional plan must use profile defaults for SLA thresholds, label each assumed value explicitly, and append a `pending_questions` block listing what was assumed and why.
   - A provisional plan is always preferable to a hard stop when the core test shape is clear.
   - If scenario type is ambiguous, do not generate a provisional plan; ask clarification using the Clarification Output Contract.

   Additional questions must be integrated into the same question system, not handled as a separate side flow:
   - Add an HTTP method question when `protocol=http` and the method cannot be inferred safely.
   - Add one or more authentication questions when auth is required or unknown and executable output depends on it.
   - Add more questions only inside Round 1 or the single Round 2 tie-break block when other critical ambiguities or missing requirements are detected.
   - Do not finalize the plan or builder handoff until all required questions from this same system are resolved.

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
   - Exactly one deterministic `Next recommended step`

4. **Determinism**: Same inputs produce identical outputs every time.
</rules>

## Terminology Contract

- **Scenario type** means the test objective shape (`load`, `stress`, `spike`, `soak`, `smoke`).
- **Profile** means default intensity presets (`minimal`, `standard`, `aggressive`) used when explicit `vus`/`duration` are missing.
- **Round** means one consolidated question block in the adaptive question system; baseline questions are Round 1 and the optional tie-break is Round 2.
- Scenario type selects the executor strategy; profile sets default intensity values.

## Language Policy

1. If user language is explicit, answer in that language.
2. If language is not explicit, default to English.
3. Keep command names, k6 metric keys, and code identifiers in English.

## Dashboard Policy

Apply deterministic recommendation:

1. CI/headless: `K6_WEB_DASHBOARD=false`
2. Local browser troubleshooting: `K6_WEB_DASHBOARD=true`
3. Local non-browser: default `K6_WEB_DASHBOARD=false` unless explicit opt-in
4. Otherwise default `false`

## HTTP Method Question

Before producing a final HTTP plan, add the method question to the same active question system:

1. Confirm primary method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) when endpoint behavior depends on method.
2. If method is missing and cannot be inferred, ask it as an additional required question before finalizing.
3. Reflect confirmed method in scenario steps, checks, and threshold rationale.

## Auth Discovery Questions

Before finalizing plan output or builder handoff parameters, add auth questions to the same active question system:

1. Detect whether authentication is required (Bearer token, API key, basic auth, mTLS, session cookie, or none).
2. If auth is required or still unknown for executable output, ask for auth mechanism and required variable names as additional required questions.
3. Never hard-code credentials in examples or generated scripts.
4. Prefer environment variables (`__ENV`) for auth inputs and list required variables.

## SLA-Scenario Coherence Validation

When both `scenario` and `sla` are available, run this coherence pass before finalizing output. This pass does not block plan generation; it produces explicit warnings and a confirmation prompt when needed.

1. `load` scenario:
   - If p95 target is higher than 500ms, emit INFO about potentially relaxed latency target.
   - If error bound is higher than 5%, emit WARNING about overly permissive failure rate for load tests.
2. `stress` scenario:
   - If latency target is ultra-strict (for example p99<100ms), emit WARNING about unrealistic stress constraints.
   - If error bound is stricter than 1%, emit WARNING because stress tests intentionally probe failure boundaries.
3. `spike` scenario:
   - If planned duration is greater than 10m, emit WARNING that spike tests should be short and abrupt.
4. `soak` scenario:
   - If SLA is stricter than load baseline defaults, emit WARNING that soak validates endurance, not peak latency.
5. `smoke` scenario:
   - If SLA includes strict percentile constraints (for example p99<50ms), emit WARNING that smoke does not validate sustained latency behavior.

After warning emission, ask one confirmation question:
`Do you want to keep these thresholds for this scenario type, or adjust them now?`

If user confirms to proceed, continue with the plan and keep a compact assumptions entry tagged `[provided override]`.

## SLA Consistency Across Multi-Environment

When planning for multiple environments (dev/staging/prod):

- Threshold values MUST BE IDENTICAL across all environments.
- VU counts MAY VARY per environment.
- Duration MAY VARY per environment.
- Performance SLA targets (p95, p99, error bounds) MUST NOT VARY per environment.

Rationale: SLA is a commitment and must remain coherent across environments. Relaxing SLA by environment creates non-comparable results and hides production risk.

Canonical cross-skill warning (must match `k6-builder` exactly):

`WARNING: SLA must be identical across environments to maintain testing coherence.`

Canonical enforcement flow (planning stage):

1. Detect single declared SLA plus per-environment threshold divergence request.
2. Emit the canonical warning string above.
3. Ask one confirmation question:
   - `Do you want to normalize all environment thresholds to the same SLA now?`
4. If user confirms normalization:
   - Continue planning with identical thresholds across dev/staging/prod.
5. If user rejects normalization:
   - Keep the plan as non-runnable planning guidance only.
   - Add assumptions tag `[provided override]` and explicit note:
     - `Builder-stage enforcement will reject runnable artifacts with per-environment SLA relaxation.`
   - Do not present relaxed thresholds as compliant defaults.

## Clarification Output Contract

When required inputs are missing and a clarification response is needed (not a provisional plan), use this exact format and nothing else:

```
missing: <comma-separated list of missing fields>
why: <one sentence explaining why these fields are required to proceed>
next_question: <single, specific question that unblocks the next step>
```

Rules:
- Use exactly these three fields — no additions, no removals.
- Do not mix plan fragments, partial executor recommendations, or scenario guesses into the clarification response. The clarification block must be self-contained.
- If multiple fields are missing, list them all in `missing` but ask only the single most-blocking question in `next_question`.
- After emitting the clarification block, end the response. Do not add caveats or partial analysis below it.

## Required k6 Invariants

Always enforce these validations before returning the plan:

1. **Thresholds are required**
   - Parse thresholds from SLA if provided.
   - If SLA is not provided, derive profile-based defaults and show them explicitly.
2. **Load profile is required**
   - Plan must include explicit VUs and duration (or explicit stage set with equivalent duration and target VUs).
   - If `vus`/`duration` are missing, derive from profile defaults and state assumptions.
   - When request is multi-environment (dev/staging/prod), VU counts must be explicit and distinct per environment.
3. **Runnable URL hard-coding is forbidden**
   - Do not generate runnable scripts with fixed live target URLs.
   - Require `__ENV.BASE_URL` (or equivalent) for executable output.
   - If target is missing, ask for it instead of using a default live URL.
4. **Parameter coherence is required**
   - Derived or explicit profile values must map to explicit `vus` and `duration`, or explicit staged equivalents.
   - If write methods are planned (`POST`/`PUT`/`PATCH`), payload assumptions and expected status must be explicit.
5. **Secrets and runnable safety are required**
   - Never hard-code credentials or tokens in runnable snippets.
   - Require environment variables (`__ENV`) for auth inputs.

6. **Protocol-specific technical quality is required**
   - gRPC plans must always include: `grpc_req_duration` metric, `client.connect()` in setup or default, and guaranteed `client.close()` on all execution paths (teardown or `try/finally`). Omitting any of these from a gRPC plan is a planning error.
   - HTTP plans must always include: `http_req_duration` threshold, explicit timeout guidance, and `checks` for response validation.
   - Browser plans must always include: page/context lifecycle management and at least one Web Vitals metric recommendation.
   - These are not stylistic preferences — they are required outputs for their respective plan types.
7. **Journey/state fidelity is required**
   - For multi-step user journeys, preserve the full requested sequence in order; do not merge, reorder, or drop steps.
   - Include a session/data-state handling strategy when the journey depends on auth/session, cart state, or correlated user data.
   - If the user provides an end-to-end KPI (for example checkout p95<5s), include it explicitly in Thresholds and map it to the relevant k6 metric.
   - **Correlation map required for flows with 3+ steps that extract data**: For every step that produces a value consumed by a later step, the plan must document it explicitly using this structure:
     ```
     correlation_map:
       - step: login → extracts: access_token → used_by: [createOrder, applyCoupon, pay, verify]
       - step: createOrder → extracts: orderId → used_by: [applyCoupon, pay, verify]
       - step: applyCoupon → extracts: discountApplied → used_by: [pay, verify]
     ```
   - For each extraction: name the variable, its source (JSON field or response header), and every downstream step that consumes it. Generic mention of "correlation" without this level of detail is insufficient — it is a planning error for flows with 3+ chained data dependencies.

## Output Contract

Every response must include these sections in order:

1. Planning Inputs Summary
2. Executor Recommendation
3. Load Profile (explicit or derived)
4. Thresholds (SLA-derived or defaults)
5. Protocol-Specific Notes
6. Assumptions & Defaults
7. Next recommended step

Assumptions & Defaults format must be compact and aligned with `k6-builder`:

- Keep this section to 3 lines maximum.
- Line 1: `Provided: <comma-separated provided inputs>`
- Line 2: `Defaults Applied: <comma-separated key=value defaults>`
- Line 3 (only when provisional): `Pending Questions: <single unblocker question>`
- Preserve explicit `[provided]` and `[assumed]` tags inline per key-value token.

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

**Note:** OR logic is not supported in this skill behavior. All conditions are treated as mandatory (AND).

### Parsing Examples
- Input: `p95<400ms,error<1%` → p95 AND error rate thresholds
- Input: `p95<500ms AND p99<900ms` → Both percentiles required
- Input: `p99<200ms` → p99 threshold must be emitted exactly (no conversion to p95-only)
- Input: `p95<2s` → Single threshold with p99 inferred (see sla-defaults.md)

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
- Always close connections on all execution paths (teardown or `try/finally`)
- Handle metadata for authentication
- Connection lifecycle guidance is mandatory:
   - Create/load client once, outside the hot iteration path.
   - Do not reconnect on every iteration unless explicitly justified.
   - Prefer `teardown()` for `client.close()` to avoid leaked connections.
- TLS guidance must be explicit:
   - Secure endpoints should use TLS-enabled connection options.
   - Non-TLS/plaintext mode must be marked as test-only assumption.
- Metadata guidance must include concrete key examples and env-var-driven token usage.
- Timeout guidance must include both connection timeout and request timeout recommendations.
- Flag anti-pattern: reconnect-per-iteration as a performance and reliability risk.

### Browser
- Use `browser.newContext()`, `context.newPage()`, `page.goto()`, `page.waitForSelector()`
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
3. Start the Adaptive Question System with baseline questions when `target`, `scenario`, `sla`, or `protocol` are missing.
4. Apply load profile defaults based on `profile`.
5. Add an HTTP method question to the same question system when protocol is HTTP and the method is still ambiguous.
6. Add auth questions to the same question system when auth is required, unknown, or otherwise blocks executable output.
7. Add more questions in the same system if other critical ambiguities or missing requirements are detected.
8. Select executor based on scenario type.
9. Parse SLA thresholds or apply deterministic defaults.
10. For journey-style plans, preserve the full requested sequence and add session/data-state handling strategy.
11. Validate explicit or derived VUs and duration.
12. Generate textual plan with recommendations.
13. Validate output structure using the Output Contract section order.
14. Add exactly one deterministic `Next recommended step` based on first unresolved dependency.
15. If `output=script` or user explicitly requests runnable code, route to k6-builder with accumulated plan parameters (`target`, `scenario`, `sla`, `protocol`, `profile`, `method`, `auth`, `duration`, `vus`).
16. Return the plan and assumptions summary.
