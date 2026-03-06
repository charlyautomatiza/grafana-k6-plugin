---
name: k6-config
description: Generate configuration setup for multi-environment testing
parameters:
  environments:
    type: string
    description: Comma-separated environment list (e.g., local,dev,staging,prod)
    default: local,staging,prod
    required: false
  setup:
    type: boolean
    description: Create config files (true) or just show examples (false)
    default: true
    required: false
---

Use the k6-core skill to generate multi-environment configuration.
