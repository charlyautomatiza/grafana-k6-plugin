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
> [?] MISSING REQUIREMENT: Missing script path or validation scope
required: script path and validation scope (protocol or expected profile)
why: deterministic validation report cannot run without target and scope
next_question: Which script should be validated and what protocol/profile context applies?
```

Do not continue validation after fallback.

## Interoperability Fallback Contract

When fallback is required, always use this portable payload shape:

```md
> [?] MISSING REQUIREMENT: <short missing requirement summary>
required: <comma-separated missing fields>
why: <why validation cannot continue deterministically>
next_question: <single question that unblocks next step>
```

Do not emit final validation findings after this fallback.

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
   - Import statements valid using explicit usage-based checklist:
     - require `k6/http` when `http.*` is used
     - require `k6` when `check` or `sleep` is used
     - require `k6/grpc` when gRPC APIs are used
     - require `k6/browser` when browser automation APIs are used

2. **Performance Best Practices**:
   - Sleep between iterations (avoid tight loops)
   - Checks implemented for assertions
   - Timeouts set on requests
   - Tagged requests for metric segmentation

3. **Protocol-Specific**:
   - HTTP: timeouts set, checks included
   - gRPC: connections properly closed
   - gRPC: flag `client.connect()` outside `default function`, `setup()`, or `teardown()` as `WARNING` (connection lifecycle leakage risk)
   - Browser: page/context closure

4. **Anti-Patterns to Flag**:
   - Hard-coded credentials
   - Insecure hard-coded environment defaults/fallbacks in runnable scripts
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
   - If user provides explicit SLA values in the validation prompt/context, compare thresholds against that SLA.
   - Flag as warning when thresholds exist but are more lax than stated SLA.
2. **Load profile is required**
   - Flag as error when no explicit load profile exists.
   - Require explicit `vus` and `duration` for time-based cases, or clear equivalent (`stages`, `iterations` + `vus`) for scenario-based definitions.
3. **Parameter coherence is required**
   - If arrival-rate parameters exist, validate `preAllocatedVUs <= maxVUs`.
   - If staged scenarios exist, validate non-empty stages with explicit duration per stage.
4. **Secrets and runnable safety are required**
   - Flag hard-coded credentials/tokens as error.
   - Flag insecure runnable defaults for secrets as error or warning based on impact.

## Output Contract

Every validation response must include these sections in order:

Output artifact requirements:

- Use a single stable output artifact name: `validation-report.md`.
- Use Markdown as the required output format.

1. Validation Summary (`pass`/`warn`/`fail`)
2. Scope and Assumptions
3. Mandatory Invariant Results
4. Detailed Findings
5. Suggested Fixes
6. Next Step

## Progressive Disclosure

Keep this file focused on validation workflow. Place deep guidance in:

- `skills/k6-validate/references/README.md`

## Workflow

1. Parse validation target (`script`) and optional context (`protocol`, `sla`, expected profile).
2. Run Tool Discovery Protocol if required input is missing.
3. Validate syntax and structure.
4. Validate performance best practices and protocol-specific rules.
5. Enforce required threshold and load-profile invariants.
6. If explicit SLA is present, compare script thresholds against the declared SLA and emit `WARNING` for more lax thresholds.
7. Run quality-hardening checks (silent catch, unsafe parse, static-analysis signals).
8. Return deterministic report in `validation-report.md` using Markdown and the Output Contract section order.
