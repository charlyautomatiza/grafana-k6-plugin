# k6-validate References

Detailed validation criteria, severity models, and remediation playbooks for k6 script validation.

## Local Reference Files

- **[severity-and-antipatterns.md](severity-and-antipatterns.md)** — Error/warning/info classification and anti-pattern catalog
- **[threshold-validation-rules.md](threshold-validation-rules.md)** — Threshold range checks and consistency rules
- **[load-profile-validation-rules.md](load-profile-validation-rules.md)** — VU/duration/stages validation patterns

## Core Topics

- Severity model (ERROR, WARNING, INFO) and when to report each
- Threshold validation patterns (missing, weak, inconsistent with SLA)
- Load profile validation patterns (missing `vus`/`duration`, malformed stages)
- Protocol-specific anti-patterns (HTTP, gRPC, browser)
- Remediation guidance with corrected examples

## Implementation Rules

1. **Missing thresholds = ERROR** — Test must have explicit success criteria
2. **Missing load profile = ERROR** — Must know VUs, duration, or iterations
3. **Protocol mismatches = WARNING** — e.g., gRPC without TLS, no auth headers
4. **Anti-patterns = WARNING or INFO** — Depends on security vs. style
5. **All findings include remediation code** — Users get concrete fixes, not just problems

## Validation Output Format

Each finding includes:
- **Description** — What problem was detected
- **Severity** — ERROR / WARNING / INFO
- **Location** — Line number(s) in script
- **Remediation** — Code example showing the fix
- **Why** — Brief explanation of the impact

## Scripted Validation Procedures

See [../../../docs/testing/TESTING.md](../../../docs/testing/TESTING.md) for:
- Unit test patterns for k6-validate skill itself
- Manual test case library for common scenarios
- Troubleshooting guide for validation edge cases
