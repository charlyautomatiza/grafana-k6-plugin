---
name: k6-data
description: Generate data-driven load test configuration with external data source
parameters:
  source:
    type: string
    description: Data file format: csv, json
    required: false
  dataType:
    type: string
    description: Type of data: users, products, orders, custom
    required: false
  vus:
    type: string
    description: Number of virtual users (for recommending data size)
    required: false
  assignment:
    type: string
    description: Data distribution strategy: round-robin, per-vu, sequential
    default: round-robin
    required: false
---

Use the k6-core skill to generate data-driven load test configuration.
