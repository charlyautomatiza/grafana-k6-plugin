# k6-validate Testing Guide

This guide provides practical tests for validating the behavior of the `k6-validate` skill itself.

## Quick Verification

### 1) Missing thresholds should fail
Input script:

```javascript
export const options = {
  vus: 10,
  duration: '1m',
};

export default function () {}
```

Expected result:
- Severity includes `ERROR`
- Finding explains that thresholds are required
- Remediation includes a valid `thresholds` block

### 2) Missing load profile should fail
Input script:

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {}
```

Expected result:
- Severity includes `ERROR`
- Finding explains that explicit load profile is required
- Remediation includes `vus + duration`, `stages`, or `vus + iterations`

### 3) Hardcoded credentials should fail
Input script:

```javascript
const token = 'plain-text-secret';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    checks: ['rate>0.95'],
  },
};

export default function () {}
```

Expected result:
- Severity includes `ERROR`
- Finding identifies hardcoded credential anti-pattern
- Remediation uses `__ENV` variables

## Manual Regression Cases

Run these checks after changes in validation logic:

1. **Valid baseline script**
   - Includes thresholds + load profile + checks
   - Expected: no blocking errors

2. **Arrival-rate scenario without `maxVUs`**
   - Expected: `ERROR` with remediation requiring `maxVUs`

3. **Browser script without cleanup**
   - Expected: `WARNING` suggesting `try/finally` and closure

4. **gRPC script without `client.close()`**
   - Expected: `WARNING` with explicit connection cleanup guidance

## Troubleshooting

- If findings are inconsistent across runs, verify deterministic rules in `skills/k6-validate/SKILL.md`.
- If a script is marked valid but lacks performance guarantees, confirm threshold checks are enabled.
- If line locations are inaccurate, validate parser assumptions and script formatting.
- If remediation snippets are invalid for k6, cross-check with local reference files in this directory.

## Review Checklist

- Threshold requirement enforced as `ERROR`
- Load profile requirement enforced as `ERROR`
- Security anti-patterns classified correctly
- Protocol-specific guidance included where relevant
- Every finding includes a clear remediation example
