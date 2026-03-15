# k6-config References

Detailed guidance for multi-environment k6 configuration and implementation patterns.

## Local Reference Files

- **[load-profiles.md](load-profiles.md)** — Standard VU and duration profiles (minimal, standard, aggressive)
- **[sla-defaults.md](sla-defaults.md)** — Threshold defaults by profile and SLA parsing rules
- **[data-integration.md](data-integration.md)** — CSV/JSON/environment variable data patterns

## Core Topics

- Multi-environment configuration strategy (dev, staging, prod)
- Threshold progression and strictness rules by environment risk
- Load profile derivation and defaults
- Secure secrets handling with `.env` and `__ENV`
- Data source selection for different test scenarios

## Implementation Rules

1. **Always define thresholds** for each environment (provided or derived from defaults)
2. **Always define load profile** (minimum: `vus` and `duration`)
3. **Document assumptions** when applying derivation rules
4. **Never hard-code credentials** in generated examples — use `__ENV` references
5. **Include stage definitions** when constructing multi-stage configs for ramp-up/ramp-down patterns
6. **Commit only `.env.example` templates** with placeholder values
7. **Never recommend committing real environment files** such as `.env.dev`, `.env.staging`, or `.env.prod`
8. **Treat reports as generated artifacts** and keep them outside committed source guidance

## Example Workflow

When user requests multi-environment k6 config:
1. Parse or ask for target environments (dev/staging/prod)
2. Apply SLA defaults from `sla-defaults.md` if not provided
3. Select load profile from `load-profiles.md` (or ask which scenario)
4. Recommend data integration approach from `data-integration.md`
5. Generate deterministic config with assumptions listed
