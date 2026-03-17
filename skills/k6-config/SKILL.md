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
> [?] MISSING REQUIREMENT: [Missing required configuration detail]
```

Do not continue generation after fallback.

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
   - Every generated environment config must include explicit `vus` and `duration`.
   - If missing, derive defaults per environment and state derivation logic.

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

## Progressive Disclosure

Keep this file focused on execution workflow. Place deep guidance in:

- `skills/k6-config/references/README.md`

## Workflow

1. Parse requested environments and optional SLA/load inputs.
2. Run Tool Discovery Protocol if critical input is missing.
3. Validate or derive thresholds for each environment.
4. Validate or derive `vus` and `duration` for each environment.
5. Determine per-environment dashboard policy (`enable` only when explicitly requested for local analysis), aligned with `k6-executor` gate semantics.
6. Generate deterministic config output and `.env.example` guidance, explicitly warning that real env files and generated reports must remain uncommitted.
7. Include a short summary of derived assumptions.
