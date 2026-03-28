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
missing: script path, validation scope
why: deterministic validation report cannot run without target and scope
next_question: Which script should be validated?
```

Do not continue validation after fallback.

## Interoperability Fallback Contract

When fallback is required, always use this portable payload shape:

```md
> [?] MISSING REQUIREMENT: <short missing requirement summary>
missing: <comma-separated missing fields>
why: <why validation cannot continue deterministically>
next_question: <single, specific question that unblocks the next step>
```

Do not emit final validation findings after this fallback.

## Language Policy

1. If user language is explicit, answer in that language.
2. If language is not explicit, default to English.
3. Keep command names, k6 metric keys, and code identifiers in English.

## Terminology Contract

- **Scenario type** means the test objective shape (`load`, `stress`, `spike`, `soak`, `smoke`) used to select executor intent.
- **Profile** means the expected intensity preset (`minimal`, `standard`, `aggressive`) used to evaluate whether `vus`, `duration`, and thresholds fit the intended load level.
- **Recommended profile** in validation references is advisory mapping from scenario type to default intensity, not a replacement for explicit user-provided values.
- When both scenario type and profile are provided, validate executor fit against scenario type first and threshold/load intensity fit against profile second.

## Validation Rules

<validation-rules>
1. **Syntax and Structure**:
   - `export const options` correctly defined
   - `export default function` present
   - Thresholds configured
   - Import statements valid using explicit usage-based minimum checklist:
     - require `k6/http` when `http.*` is used
     - require `k6` when `check` or `sleep` is used
     - require `k6/grpc` when gRPC APIs are used
     - require `k6/browser` when browser automation APIs are used
   - For broader module compatibility and allowed import coverage, cross-check `references/goja-k6-compatibility-matrix.md`.

2. **Performance Best Practices**:
   - Sleep between iterations (avoid tight loops); if missing, report at least `WARNING`
   - Checks implemented for assertions; if absent, report `ERROR`
   - Timeouts set on requests
   - Tagged requests for metric segmentation; if missing for multi-endpoint flows, report `WARNING`
   - Profile/load-context clarity present (scenario type and expected profile intensity are inferable); if missing, report `WARNING`

3. **Protocol-Specific**:
   - HTTP: timeouts set, checks included
   - gRPC: connections properly closed
   - gRPC: flag `client.connect()` outside `default function`, `setup()`, or `teardown()` as `WARNING` (connection lifecycle leakage risk)
   - Browser: page/context closure
   - WebSocket: socket lifecycle hygiene (`on('open')`, `on('error')`, graceful close path, and bounded session duration)
   - Browser: if page/context closure is missing in any iteration path, report `WARNING`

4. **Anti-Patterns to Flag**:
   - Hard-coded credentials
   - Hard-coded production URLs (for example `https://api.prod...`) in runnable scripts without `__ENV` control
   - Insecure hard-coded environment defaults/fallbacks in runnable scripts (without `__ENV` fallback)
   - Unbounded loops
   - Synchronous waits without reason
   - Silent `catch` blocks that swallow errors
   - Unsafe parsing without guarded failure handling
   - Quality violations mapped to static-analysis concerns (including S7726-class findings)
   - **Anonymous default export function** — `export default function() {}` without a name is a quality violation. Flag as `WARNING`: "Default export function should be named for traceability and debuggability. Example: `export default function runLoad() {}`". The naming convention is `run<ScenarioType>` or `run<Protocol><ScenarioType>`.
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
   - Flag hard-coded production URLs without `__ENV` control as at least `WARNING` (elevate to `ERROR` when credentials or sensitive paths are coupled).
5. **Lifecycle hygiene is required**
   - Browser scripts must close `page`/`context` in all execution paths.
   - gRPC scripts must show connect/invoke/close lifecycle consistency.
   - WebSocket scripts must include open/message/error/close handling and an explicit bounded lifetime.

## Output Contract

Every validation response must include these sections in order:

Output artifact requirements:

- Use a single stable output artifact name: `validation-report.md`.
- Use Markdown as the required output format.
- Use exactly these H2 section headers in this order — no sections may be added, removed, reordered, or renamed:
   1. `## Validation Summary`
   2. `## Scope and Assumptions`
   3. `## Mandatory Invariant Results`
   4. `## Detailed Findings`
   5. `## Suggested Fixes`
   6. `## Next Step`
- `## Validation Summary` must always begin with a status badge on its own line: `**Status: PASS**`, `**Status: WARN**`, or `**Status: FAIL**`.
- `## Mandatory Invariant Results` must include a checklist item for each invariant from `Required k6 Invariants`, even if the result is ✅ pass.

**Output budget:**
- Sections `Validation Summary` + `Mandatory Invariant Results` + `Detailed Findings` combined must target ≤ 600 tokens total.
- Use a compact findings table with these columns: `#` · `Severity` · `Finding` · `Recommended Fix` (one-liner max).
- Extended explanations, code examples, and multi-step remediation instructions belong exclusively in `Suggested Fixes`. Each fix should include:
  - `issue`: The problem detected
  - `severity`: ERROR, WARNING, or INFO
  - `evidence`: Code snippet or line reference showing the issue
  - `fix_snippet`: Executable corrected code (when applicable)
- Do not repeat finding descriptions between `Detailed Findings` and `Suggested Fixes` — `Detailed Findings` identifies; `Suggested Fixes` remediates.
- **Token budget rule**: If combined findings exceed token budget, deprioritize INFO-level findings; ERROR and WARNING must always be reported.

**Findings table format:**

| # | Severity | Finding | Recommended Fix |
|---|---|---|---|
| 1 | ERROR | Missing thresholds | Add `thresholds` block to `options` |
| 2 | WARNING | Anonymous default function | Rename to `export default function runLoad()` |

## Progressive Disclosure

Keep this file focused on validation workflow. Place deep guidance in:

- `skills/k6-validate/references/README.md`

## Workflow

1. Parse validation target (`script`) and optional context (`protocol`, `sla`, scenario type, profile).
2. Run Tool Discovery Protocol if required input is missing.
3. Validate syntax and structure.
4. Validate performance best practices and protocol-specific rules.
5. Enforce required threshold, load-profile, and lifecycle-hygiene invariants.
6. If explicit SLA is present, compare script thresholds against the declared SLA and emit `WARNING` for more lax thresholds.
7. Run quality-hardening checks (silent catch, unsafe parse, static-analysis signals, hard-coded production URLs, missing checks/sleep/tags).
8. Return deterministic report in `validation-report.md` using Markdown and the Output Contract section order.
