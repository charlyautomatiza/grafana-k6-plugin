---
name: k6-thresholds
description: Generate or configure threshold definitions for SLA enforcement
parameters:
  target:
    type: string
    description: Target metric or script to configure thresholds for
    required: false
  metrics:
    type: string
    description: Metrics to track: p95, p99, rate, custom (comma-separated)
    default: p95,p99,rate
    required: false
---

Use the k6-core skill to generate threshold definitions.
