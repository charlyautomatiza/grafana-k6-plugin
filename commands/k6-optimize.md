---
name: k6-optimize
description: Optimize existing k6 scripts for performance and best practices
parameters:
  script:
    type: string
    description: Path to k6 script file to optimize
    required: true
  focus:
    type: string
    description: Optimization focus area: thresholds, checks, scenarios, performance, all
    default: all
    required: false
---

Use the k6-core skill to optimize the k6 script at the specified path.
