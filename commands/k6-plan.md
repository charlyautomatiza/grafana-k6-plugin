---
name: k6-plan
description: Plan and generate k6 test scenarios with interactive parameter resolution
parameters:
  scenario:
    type: string
    description: Test scenario type: load, stress, spike, soak, smoke
    required: false
  target:
    type: string
    description: Target URL or endpoint to test
    required: false
  sla:
    type: string
    description: SLA requirements (e.g., p99<500ms)
    required: false
  profile:
    type: string
    description: Load profile: minimal, standard, aggressive
    default: standard
    required: false
  protocol:
    type: string
    description: Protocol type: http, grpc, browser
    default: http
    required: false
  duration:
    type: string
    description: Override duration (e.g., 10m, 30s)
    required: false
  vus:
    type: string
    description: Override VU count (e.g., 50, 100)
    required: false
---

Use the k6-core skill to plan and generate k6 test scenarios.

When critical parameters (target, scenario, sla) are missing, invoke the 3-Question Protocol from the k6-core skill.
