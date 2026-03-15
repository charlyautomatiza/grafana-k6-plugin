---
name: k6-validate
description: Validate k6 scripts against structural, performance, and reliability standards. Use when users ask to validate a k6 script, review k6 test quality, or detect anti-patterns before execution.
user-invocable: true
disable-model-invocation: false
license: MIT
metadata:
  version: 0.1.0
  category: performance-testing
---
- User says: "find issues in my k6 scenario"
- User says: "check if my thresholds and load profile are correct"

## Tool Discovery Protocol

At the beginning of the workflow, detect and use interaction tools in this order:

1. If `AskUserQuestion` exists, use it for required inputs.
2. Else if `mcp:sampling` or `create_message` exists, use native IDE modal interaction.
3. Else if `confirm_action` exists, use it for critical confirmations.
4. Else emit the exact fallback and end the turn:

```md
> [?] MISSING REQUIREMENT: [Missing script path or validation scope]
```

Do not continue validation after fallback.

## Language Policy

1. If user language is explicit, answer in that language.
2. If language is not explicit, default to English.
3. Keep command names, k6 metric keys, and code identifiers in English.

## Validation Rules

<validation-rules>
1. **Syntax and Structure**:
   - `export const options` correctly defined
   - `export default function` present
   - Thresholds configured
   - Import statements valid

2. **Performance Best Practices**:
   - Sleep between iterations (avoid tight loops)
   - Checks implemented for assertions
   - Timeouts set on requests
   - Tagged requests for metric segmentation

3. **Protocol-Specific**:
   - HTTP: timeouts set, checks included
   - gRPC: connections properly closed
   - Browser: page/context closure

4. **Anti-Patterns to Flag**:
   - Hard-coded credentials
   - Missing environment variable fallbacks
   - Unbounded loops
   - Synchronous waits without reason
   - Silent `catch` blocks that swallow errors
   - Unsafe parsing without guarded failure handling
   - Quality violations mapped to static-analysis concerns (including S7726-class findings)
</validation-rules>

## Required k6 Invariants

Always enforce these validations as mandatory checks:

1. **Thresholds are required**
   - Flag as error when thresholds are missing.
   - Flag as warning when thresholds exist but do not reflect stated SLA.
2. **Load profile is required**
   - Flag as error when no explicit load profile exists.
   - Require explicit `vus` and `duration` for time-based cases, or clear equivalent (`stages`, `iterations` + `vus`) for scenario-based definitions.

## Progressive Disclosure

Keep this file focused on validation workflow. Place deep guidance in:

- `skills/k6-validate/references/README.md`

## Workflow

1. Parse validation target (`script`) and optional context (`protocol`, `sla`, expected profile).
2. Run Tool Discovery Protocol if required input is missing.
3. Validate syntax and structure.
4. Validate performance best practices and protocol-specific rules.
5. Enforce required threshold and load-profile invariants.
6. Run quality-hardening checks (silent catch, unsafe parse, static-analysis signals).
7. Return deterministic report with pass/warn/fail, findings, and fixes.
