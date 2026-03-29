# k6-builder References

Complete local reference set for runnable artifact generation.

## Local Reference Files

- **[executor-decision-matrix.md](executor-decision-matrix.md)** - Executor trade-offs, mapping, and capacity guardrails
- **[load-profiles.md](load-profiles.md)** - Standard VU and duration profiles (minimal, standard, aggressive)
- **[sla-defaults.md](sla-defaults.md)** - SLA defaults, parsing rules, and environment scaling boundaries
- **[data-integration.md](data-integration.md)** - CSV/JSON/environment variable data source patterns
- **[protocol-guide.md](protocol-guide.md)** - HTTP, gRPC, and browser generation patterns and examples

## Builder Focus

Use these references to support:
- executor selection translated into runnable options
- profile and SLA defaults translated into thresholds
- protocol-specific runnable script scaffolding
- multi-environment scaling and safe env-variable patterns

## Safety Notes

- Never hard-code credentials in runnable artifacts.
- Prefer `__ENV` placeholders for secrets and base URLs.
- Emit `.env.example` placeholders only.
