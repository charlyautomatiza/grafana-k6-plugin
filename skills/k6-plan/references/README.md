# k6-plan References

Complete reference materials for comprehensive k6 performance test planning.

## Local Reference Files

- **[load-profiles.md](load-profiles.md)** — Standard VU and duration profiles (minimal, standard, aggressive)
- **[sla-defaults.md](sla-defaults.md)** — Default SLA thresholds and parsing rules
- **[protocol-guide.md](protocol-guide.md)** — HTTP, gRPC, and browser protocol patterns and examples
- **[data-integration.md](data-integration.md)** — CSV/JSON/environment variable data source patterns

## Core Topics

- SLA parsing, threshold derivation, and metric mapping
- Scenario-to-executor mapping heuristics (load, stress, spike, soak, smoke)
- Profile defaults, stage construction, and duration estimation
- Protocol-specific planning (HTTP, gRPC, browser VU requirements)
- Data source selection and integration strategies

## Implementation Rules

1. **Plans must include explicit thresholds** — provided by user or derived from defaults
2. **Plans must include explicit load profile** — minimum: `vus` and `duration`, or staged equivalents
3. **Missing critical parameters trigger the question protocol** before plan generation
4. **All assumptions must be listed** in output when defaults are applied
5. **Each plan includes executor recommendation** with explicit rationale

## Decision Criteria

When building a test plan, the skill gathers these decisions:

1. **Target endpoint/URL** — what are we testing?
2. **Scenario type** — load, stress, spike, soak, or smoke?
3. **SLA requirements** — latency (p95/p99), error rate, success rate?
4. **Protocol context** — HTTP, gRPC, browser, or mixed?
5. **Load profile** — explicit VUs/duration, or derive from scenario?

## Example Workflow

User asks: "plan a k6 load test for my API"

1. Executor asks: What's the target URL?
2. Executor asks: What scenario type? (default: load)
3. Executor asks: What are your SLA requirements? (default: standard profile)
4. Executor derives: HTTP protocol, ramping-vus executor, standard load profile
5. Executor generates: Complete plan with thresholds, stages, and assumptions listed
