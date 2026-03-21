---
name: k6-config
description: Build production-ready k6 configuration for multi-environment testing. Use when users ask to create k6 config files, set up k6 environments, or define thresholds and load settings per environment.
user-invocable: true
disable-model-invocation: false
license: MIT
metadata:
  version: 0.1.0
  category: performance-testing
---
- User says: "generate dev/staging/prod k6 settings"
- User says: "define thresholds and VUs by environment"

## Tool Discovery Protocol

At the beginning of the workflow, detect and use interaction tools in this order:

1. If `AskUserQuestion` exists, use it for required inputs.
2. Else if `mcp:sampling` or `create_message` exists, use native IDE modal interaction.
3. Else if `confirm_action` exists, use it for critical confirmations.
4. Else emit the exact fallback and end the turn:

```md
> [?] MISSING REQUIREMENT: Missing required configuration detail
required: environment set, load profile inputs, and SLA target
why: deterministic multi-environment config cannot be generated safely
next_question: Which environments should be generated (dev/staging/prod) and what SLA should apply?
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

Do not emit final configuration output after this fallback.

## Language Policy

1. If user language is explicit, answer in that language.
2. If language is not explicit, default to English.
3. Keep command names, k6 metric keys, and code identifiers in English.

## Required k6 Invariants

Always enforce these validations before returning configuration output:

1. **Thresholds are required**
   - Every generated environment config must include thresholds.
   - If SLA values are missing, derive defaults and state them explicitly.
2. **Load profile is required**
   - Every generated environment config must define a concrete load profile:
     - either explicit `vus` and `duration`, or
     - a staged equivalent using `stages` (or `scenarios` that use `stages`).
   - If a load profile is missing, derive defaults per environment and state derivation logic.
3. **Parameter coherence is required**
   - If arrival-rate style parameters are included, enforce `preAllocatedVUs <= maxVUs`.
   - If `stages` are used, ensure stage durations are explicit and non-empty.
4. **Secrets and runnable safety are required**
   - Never hard-code credentials or tokens in runnable examples.
   - Require environment-variable placeholders (`__ENV` or `.env.example`) for secrets.

## Configuration Patterns

<patterns>
### Environment-Based Config
Generate separate configs for dev/staging/prod with environment-specific:
- Base URLs
- VU counts (scaled by environment)
- Duration (shorter in dev)
- Threshold strictness

### Secrets Management
- Use environment variables for sensitive data
- Provide .env.example templates
- Never hard-code credentials
- Commit only placeholder-based `.env.example` files
- Do not recommend committing `.env.dev`, `.env.staging`, `.env.prod`, or any env file with live values
- Treat generated reports as local artifacts, not committed source files

### Web Dashboard Controls
- Support explicit dashboard toggle in generated config guidance
- Use `K6_WEB_DASHBOARD=true` only for local exploratory runs
- Default to dashboard disabled for CI and headless execution
</patterns>

## Responsibility Boundary With k6-executor

- `k6-executor` decides executor-level recommendation for a specific scenario and emits one dashboard recommendation for that scenario.
- `k6-config` applies environment-level policy (dev/staging/prod) and operational defaults.
- If both are used, `k6-config` must preserve executor recommendation intent while enforcing environment safety defaults.
- Override precedence rule: CI safety defaults override executor recommendation only when explicit conflict exists (e.g., executor recommends `K6_WEB_DASHBOARD=true` for browser UX troubleshooting, but script runs in CI/non-interactive). Local runs preserve executor intent unless user explicitly disables via environment configuration.

Dashboard precedence order shared with `k6-executor`:

1. CI/non-interactive contexts default to `K6_WEB_DASHBOARD=false`; CI policy overrides any executor recommendation regardless of executor intent.
2. Local interactive browser troubleshooting defaults to `K6_WEB_DASHBOARD=true`; an executor-provided `K6_WEB_DASHBOARD=true` recommendation counts as an explicit opt-in for this case.
3. Local non-browser runs default to `K6_WEB_DASHBOARD=false` unless user or executor explicitly opts in.
4. All other contexts default to `K6_WEB_DASHBOARD=false`.

## Output Contract

Every response must include these sections in order:

1. Environment Matrix
2. Configuration Snippets (by environment)
3. Thresholds (provided or derived)
4. Load Profile (explicit `vus`/`duration` or staged equivalent)
5. Guardrail Validation
6. Web Dashboard Policy
7. Assumptions and Next Step

## Progressive Disclosure

Keep this file focused on execution workflow. Place deep guidance in:

- `skills/k6-config/references/README.md`

## Workflow

1. Parse requested environments and optional SLA/load inputs.
2. Run Tool Discovery Protocol if critical input is missing.
3. Validate or derive thresholds for each environment.
4. Validate or derive `vus` and `duration` for each environment.
5. Determine per-environment dashboard policy using shared precedence with `k6-executor` (CI/headless first, local-browser second, default false otherwise).
6. Generate deterministic config output and `.env.example` guidance, explicitly warning that real env files and generated reports must remain uncommitted.
7. Validate guardrails and return output using the Output Contract section order.
8. Include a short summary of derived assumptions.
