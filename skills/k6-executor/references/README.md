# k6-executor References

Detailed decision support for executor selection and performance load modeling.

## Local Reference Files

- **[load-profiles.md](load-profiles.md)** — Standard VU and duration profiles for executor mapping
- **[executor-decision-matrix.md](executor-decision-matrix.md)** — Trade-offs and recommendations by workload type

## Core Topics

- VU-based vs arrival-rate-based executor categories
- Time-based vs iteration-based workload modeling
- Capacity guardrails for arrival-rate executors (`preAllocatedVUs`, `maxVUs`)
- Trade-offs between `constant-*`, `ramping-*`, and iteration executors
- Edge cases and anti-patterns in executor configuration

## Executor Types Supported

### Duration-based executors
- **constant-vus** — Fixed VU count over duration (basic load test)
- **ramping-vus** — Progressive ramp of VU count (realistic ramp-up behavior)
- **ramping-arrival-rate** — Progressive ramp of arrival rate (rate-based load)
- **constant-arrival-rate** — Fixed arrival rate, variable VUs (rate-controlled)

### Iteration-based executors
- **per-vu-iterations** — Fixed iterations per VU (control by iterations)
- **shared-iterations** — Fixed total iterations across all VUs
- **externally-controlled** — External system controls VUs and iterations

## Implementation Rules

1. **Recommendation must include threshold guidance** (from SLA or defaults)
2. **Recommendation must include valid load profile** (VUs/duration or iteration count)
3. **When inputs incomplete, ask clarifying questions** using Tool Discovery Protocol before recommending
4. **Explain trade-offs** between chosen and alternative executors
5. **Validate guardrails** (e.g., preAllocatedVUs ≤ maxVUs for arrival-rate)

## Decision Workflow

When user asks "which executor should I use?":
1. Clarify test goal (load vs stress vs spike vs soak vs smoke)
2. Determine control preference (by VUs vs by requests/sec vs by iterations)
3. Determine duration preference (fixed time vs fixed iterations)
4. Ask about scalability requirements (auto-scaling VUs?)
5. Map to executor type and explain why
