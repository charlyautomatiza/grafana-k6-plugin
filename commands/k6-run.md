---
name: k6-run
description: Generate k6 run command with proper environment and configuration
parameters:
  script:
    type: string
    description: Path to k6 script to execute
    required: true
  env:
    type: string
    description: Environment context: local, dev, staging, prod
    default: local
    required: false
  duration:
    type: string
    description: Test duration override (e.g., 30s, 5m)
    required: false
  vus:
    type: string
    description: Override VU count (e.g., 50, 100)
    required: false
---

Use the k6-core skill to generate the k6 run command.
