---
name: k6-validate
description: Validate k6 script syntax, structure, and best practices compliance
parameters:
  script:
    type: string
    description: Path to k6 script file to validate
    required: true
  strict:
    type: boolean
    description: Enable strict validation including style and best practices
    default: true
    required: false
---

Use the k6-core skill to validate the k6 script.
