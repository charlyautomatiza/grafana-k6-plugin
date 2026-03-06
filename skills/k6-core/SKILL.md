---
name: k6-core
description: k6 performance testing skill with deterministic script generation
license: MIT
metadata:
  version: 1.0.0
  category: performance-testing
  repository: k6-performance
disable-model-invocation: true
user-invokable: true
---

# k6 Core Performance Testing Skill

This skill provides deterministic k6 script generation with interactive ambiguity resolution for load testing, stress testing, and performance validation.

<rules>
## Core Principles

1. **Determinism**: Same inputs MUST produce identical outputs every time
2. **Clarity over Assumption**: When critical parameters are missing, STOP and ask questions
3. **k6 Best Practices**: All generated scripts follow official k6.io documentation patterns
4. **Goja Compliance**: All code must be valid Goja (k6's JavaScript runtime) syntax
5. **Mandatory Validation**: Every script includes checks and thresholds for observability

## Command Priority

When multiple actions could apply, follow this priority:
```
validate > optimize > thresholds > plan > run
```

## No Hardcoded Values Rule

**CRITICAL**: Scripts MUST NOT contain hardcoded URLs, API tokens, usernames, or credentials.

### Rule
1. **URLs MUST use environment variables or config files**
   - ❌ BAD: `http.get('https://api.example.com/users')`
   - ✅ GOOD: `http.get(`${__ENV.BASE_URL}/users`)`
   
2. **API Tokens MUST use environment variables**
   - ❌ BAD: `const token = 'secret-token-123';`
   - ✅ GOOD: `const token = __ENV.API_TOKEN || '';`

3. **Test Data/Credentials MUST use**
   - CSV/JSON files from disk
   - Environment variables
   - Configuration files
   - NEVER hardcoded strings in script

### When User Suggests Hardcoded Values
If user provides target URL or credentials without parameterization:
1. Generate script with environment variables
2. Show usage with `--env` flags
3. Add comment: `// Usage: k6 run --env BASE_URL=... --env API_TOKEN=... script.js`
4. If user insists on hardcode, invoke **3-Question Protocol** to understand why

### Allowed Exceptions (Only for Defaults)
```javascript
// OK: Default value if env var not set
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const timeout = __ENV.TIMEOUT || '30s';
```

Defaults should be:
- Safe (localhost, public test services)
- Non-sensitive (no real tokens)
- Development-only values

## Critical Parameter Rules

### For /k6.plan Command
If ANY of these are missing, invoke the **3-Question Protocol**:
- `target`: The URL/endpoint to test
- `scenario`: The test scenario type (load/stress/spike/soak/smoke)
- `sla`: Performance requirements/SLAs

### 3-Question Protocol

When critical parameters are missing:

**Step 1**: Attempt to invoke `AskUserQuestion` tool (Claude) or `ask_user` tool (Gemini)

**Step 2**: If tools unavailable (Copilot/fallback), emit questions in numbered Markdown format:

```markdown
I need to clarify a few details before generating your k6 script:

1. **What is the target URL or endpoint?**
   - Example: https://api.example.com/v1/users

2. **What test scenario type do you need?**
   - `load`: Standard load testing with gradual ramp-up
   - `stress`: Push system beyond normal capacity
   - `spike`: Sudden traffic surge testing
   - `soak`: Extended duration stability testing
   - `smoke`: Minimal validation test

3. **What are your SLA/performance requirements?**
   - Example: p99 < 500ms, error rate < 1%
```

**Step 3**: Wait for user answers, then proceed with script generation

## k6 Code Generation Rules

### Structure Requirements
Every generated script MUST include:
1. Proper imports at the top
2. `export const options = { ... }` configuration
3. `export default function scenarioName() { ... }` main test logic
4. At least 2 meaningful checks
5. At least 2 threshold definitions

### HTTP Protocol Best Practices
- Import: `import http from 'k6/http';`
- Use `http.batch()` for parallel requests (more efficient than sequential)
- Always set timeout: `timeout: '30s'`
- Include `check()` for functional validation
- Handle response errors appropriately
- Use tags for request categorization: `tags: { name: 'api-call' }`

### gRPC Protocol Best Practices
- Import: `import grpc from 'k6/net/grpc';`
- Load proto: `const client = new grpc.Client(); client.load([], 'service.proto');`
- Always `connect()` before `invoke()`
- Close connection in teardown
- Handle metadata and authentication
- Set appropriate timeouts

### k6/browser Best Practices
- Import: `import { browser } from 'k6/browser';`
- Launch browser in setup or per-iteration
- Use appropriate selectors (prefer data-testid)
- Implement wait strategies: `page.waitForSelector()`
- Collect Web Vitals metrics when relevant
- Close browser/page properly
- Consider headless mode for CI/CD

### Thresholds Syntax
Thresholds enforce SLAs and fail tests on violation:

```javascript
thresholds: {
  'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95th & 99th percentile
  'http_req_failed': ['rate<0.01'],                  // Error rate < 1%
  'http_reqs': ['rate>100'],                         // Min throughput
  'checks': ['rate>0.95'],                           // 95% checks pass
}
```

### Checks vs Thresholds
- **Checks**: Functional validation (does response contain expected data?)
- **Thresholds**: Performance validation (are SLAs met?)
- Use BOTH in every script

### Scenarios Configuration
Executor types:
- `constant-vus`: Fixed VUs for entire duration
- `ramping-vus`: Gradually increase/decrease VUs
- `constant-arrival-rate`: Fixed request rate
- `ramping-arrival-rate`: Variable request rate
- `per-vu-iterations`: Each VU runs N iterations

Example multi-scenario:
```javascript
scenarios: {
  warmup: {
    executor: 'constant-vus',
    vus: 5,
    duration: '1m',
    startTime: '0s',
  },
  peak: {
    executor: 'ramping-vus',
    startVUs: 10,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 0 },
    ],
    startTime: '1m',
  },
}
```

### Load Profile Defaults

**minimal**: Quick smoke test
- VUs: 1-5
- Duration: 30s-1m
- Stages: None or simple ramp

**standard** (default): Realistic load test
- VUs: 10-50
- Duration: 5-10m
- Stages: Ramp up (2m) → Steady (5m) → Ramp down (2m)

**aggressive**: Stress/spike testing
- VUs: 50-500+
- Duration: 10-30m
- Stages: Rapid ramp or spike pattern

### Goja Security & Constraints
- No Node.js modules (fs, path, etc.)
- No async/await (use k6-specific patterns)
- No CommonJS (use ES6 imports)
- Limited standard library (check k6 docs)
- Use k6-provided modules only

## Configuration & Environment Variables

All k6 scripts SHOULD be parameterized for flexibility across environments.

### Environment Variable Patterns

**Using `__ENV` with defaults:**
```javascript
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const apiToken = __ENV.API_TOKEN || '';
const environment = __ENV.ENVIRONMENT || 'local';
const timeout = __ENV.TIMEOUT || '30s';
const dataFile = __ENV.DATA_FILE || './data/users.csv';
```

**Passing variables to k6:**
```bash
# Via --env flag (recommended)
k6 run --env BASE_URL=https://api.example.com script.js
k6 run -e BASE_URL=https://api.example.com -e API_TOKEN=xyz script.js

# Via system environment
export BASE_URL=https://api.example.com
k6 run script.js

# Via .env file (source first)
source .env
k6 run script.js
```

**Configuration precedence (lowest to highest):**
1. Script defaults (`__ENV.VAR || 'default'`)
2. k6.json config file
3. Script export const options
4. Environment variables (`--env` flags)
5. CLI flags (`--vus`, `--duration`) ← Wins

### Configuration Files

Use k6.json for shared configuration:
```json
{
  "stages": [
    { "duration": "2m", "target": 20 },
    { "duration": "5m", "target": 20 },
    { "duration": "2m", "target": 0 }
  ],
  "thresholds": {
    "http_req_duration": ["p(95)<500"],
    "http_req_failed": ["rate<0.01"]
  }
}
```

## Data Management

Load test data from external sources, NOT hardcoded.

### CSV Data (Tabular)
```javascript
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';

const dataFile = __ENV.DATA_FILE || './users.csv';
const users = new SharedArray('users', function () {
  return papaparse.parse(open(dataFile), { header: true }).data;
});

export default function () {
  const user = users[__VU % users.length];  // Round-robin
  // Use user.username, user.password, etc.
}
```

**Best for:**
- User credentials (username, password, email)
- Tabular data from spreadsheet exports
- Large datasets in rows/columns format

### JSON Data (Structured)
```javascript
import { SharedArray } from 'k6/data';

const dataFile = __ENV.DATA_FILE || './products.json';
const products = new SharedArray('products', function () {
  return JSON.parse(open(dataFile)).products;
});

export default function () {
  const product = products[(__VU - 1) % products.length];  // Per-VU
  // Use product.id, product.price, etc.
}
```

**Best for:**
- Complex nested objects
- Data with mixed types (numbers, booleans, objects)
- Configuration-like data

### Data Assignment Strategies
- **Round-robin**: `data[__VU % data.length]` - Evenly distributes, allows repeats
- **Per-VU**: `data[(__VU - 1) % data.length]` - Each VU gets unique data
- **Sequential**: `data[scenario.iterationInTest % data.length]` - Progressive through data

**CRITICAL: Always use `SharedArray`** - Prevents memory explosion. Each VU gets reference, not copy.

**See [Data Management Examples](../../examples/data-management) for complete patterns.**

## Dashboard & Local Metrics Visualization

Monitor test metrics in real-time using k6's web dashboard.

### Enable Dashboard
```bash
K6_WEB_DASHBOARD=true k6 run script.js
```

### Dashboard Configuration
```bash
K6_WEB_DASHBOARD=true \
K6_WEB_DASHBOARD_HOST=0.0.0.0 \
K6_WEB_DASHBOARD_PORT=5665 \
K6_WEB_DASHBOARD_OPEN=true \
K6_WEB_DASHBOARD_PERIOD=5s \
K6_WEB_DASHBOARD_EXPORT=report.html \
k6 run script.js
```

**Key environment variables:**
- `K6_WEB_DASHBOARD=true` - Enable dashboard (default: false)
- `K6_WEB_DASHBOARD_OPEN=true` - Auto-open in browser
- `K6_WEB_DASHBOARD_EXPORT=report.html` - Export HTML report when done
- `K6_WEB_DASHBOARD_PERIOD=5s` - Dashboard update frequency
- `K6_WEB_DASHBOARD_PORT=5665` - Dashboard port (default)

### Metrics Shown in Dashboard
- **HTTP Metrics**: Duration (p50, p75, p95, p99), Error rate, Throughput
- **Scenario Progress**: VU count, Active/completed iterations, Timeline
- **Checks**: Pass/fail rate for functional validations
- **Custom Metrics**: Any custom metrics defined in script

### RED Method Metrics
Monitor these core metrics during load test:
- **Requests**: How many requests/second (throughput)
- **Errors**: What percentage are failing (availability)
- **Duration**: What are response times (latency)

```javascript
thresholds: {
  'http_reqs': ['rate>10'],              // Throughput check
  'http_req_failed': ['rate<0.01'],      // Error rate check
  'http_req_duration': ['p(95)<500'],    // Latency check
}
```

</rules>

<grammar>
## Command Syntax

All commands follow the pattern:
```
/k6.[action] [param]=[value] [param2]=[value2]
```

### /k6.plan
Generate a k6 test script from requirements.

**Syntax**: `/k6.plan scenario=[type] target=[url] sla=[requirements] profile=[size] protocol=[type]`

**Parameters**:
- `scenario`: load | stress | spike | soak | smoke (CRITICAL)
- `target`: URL or endpoint to test (CRITICAL)
- `sla`: Performance requirements, e.g., "p99<500ms" (CRITICAL)
- `profile`: minimal | standard | aggressive (default: standard)
- `protocol`: http | grpc | browser (default: http)
- `duration`: Override duration, e.g., "10m"
- `vus`: Override VU count, e.g., "50"

**Generated Scripts ALWAYS:**
- ✅ Use `__ENV` for BASE_URL (never hardcoded)
- ✅ Use `__ENV` for API_TOKEN, credentials
- ✅ Include usage comment: `// Usage: k6 run --env BASE_URL=... script.js`
- ✅ Provide defaults for all env vars
- ✅ Include 2+ meaningful checks
- ✅ Include 2+ SLA-aligned thresholds
- ✅ Use appropriate executor type (default: ramping-vus)

**Examples**:
- `/k6.plan scenario=load target=https://api.example.com sla=p95<300ms`
- `/k6.plan scenario=stress target=https://test.com sla=p99<1s profile=aggressive`
- `/k6.plan protocol=browser target=https://shop.example.com scenario=load`

**Note on Target URL:**
The `target` parameter is for documentation and data only. Generated script will use:
```javascript
const baseUrl = __ENV.BASE_URL || 'https://api.example.com';  // Parameterized!
```
Users run with: `k6 run --env BASE_URL=https://actual-url.com script.js`

### /k6.optimize
Optimize an existing k6 script for performance and best practices.

**Syntax**: `/k6.optimize script=[path] focus=[area]`

**Parameters**:
- `script`: Path to script file (REQUIRED)
- `focus`: thresholds | checks | scenarios | performance | all (default: all)

**Examples**:
- `/k6.optimize script=test.js focus=thresholds`
- `/k6.optimize script=load-test.js`

### /k6.validate
Validate k6 script for syntax, structure, and best practices.

**Syntax**: `/k6.validate script=[path] strict=[boolean]`

**Parameters**:
- `script`: Path to script file (REQUIRED)
- `strict`: true | false (default: true)

**Examples**:
- `/k6.validate script=my-test.js`
- `/k6.validate script=api-test.js strict=false`

### /k6.thresholds
Generate threshold configurations for SLA enforcement.

**Syntax**: `/k6.thresholds target=[metric|script] metrics=[list]`

**Parameters**:
- `target`: Script or metric name
- `metrics`: Comma-separated: p95, p99, rate, custom (default: p95,p99,rate)

**Examples**:
- `/k6.thresholds target=api-test.js metrics=p99,rate`
- `/k6.thresholds metrics=p95,p99`

### /k6.run
Generate k6 execution command with proper configuration.

**Syntax**: `/k6.run script=[path] env=[environment] duration=[time]`

**Parameters**:
- `script`: Path to script file (REQUIRED)
- `env`: local | dev | staging | prod (default: local)
- `duration`: Override test duration
- `vus`: Override VU count

**Examples**:
- `/k6.run script=load-test.js env=staging`
- `/k6.run script=api-test.js duration=5m vus=100`

### /k6.executor
Help select the right executor type with interactive guidance.

**Syntax**: `/k6.executor goal=[description]`

**Parameters**:
- `goal`: Natural language description of test goal

**Invokes 3-Question Protocol to determine:**
1. Do you need to control VU count or request rate?
2. Does load stay fixed or change over time?
3. Is duration time-based or iteration-based?

**Examples**:
- `/k6.executor goal=baseline testing with 50 users`
- `/k6.executor goal=find breaking point progressively`
- `/k6.executor goal=validate we can handle 500 requests per second`

**Output**: Recommended executor type + rationale + example config

### /k6.data
Generate data-driven load test configuration with external data source.

**Syntax**: `/k6.data source=[csv|json] dataType=[users|products|custom] vus=[n] assignment=[round-robin|per-vu|sequential]`

**Parameters**:
- `source`: csv | json (CRITICAL - file format)
- `dataType`: users | products | orders | custom (what data represents)
- `vus`: Number of virtual users (optional, for recommending data size)
- `assignment`: round-robin | per-vu | sequential (optional, default: round-robin)

**Invokes questions about:**
1. What's the file format? (CSV or JSON)
2. What type of data? (users, products, test data)
3. How to distribute data to VUs? (round-robin, per-VU, sequential)

**Output:**
- Complete data loading snipp with SharedArray
- Example data file format
- Usage instructions with `--env DATA_FILE=...`

**Examples**:
- `/k6.data source=csv dataType=users`
- `/k6.data source=json dataType=products vus=20 assignment=per-vu`
- `/k6.data source=csv dataType=custom`

### /k6.config
Generate configuration setup for multi-environment testing.

**Syntax**: `/k6.config environments=[local,dev,staging,prod] setup=[true|false]`

**Parameters**:
- `environments`: Comma-separated environment list (default: local,staging,prod)
- `setup`: true = full setup (files + examples) | false = just examples (default: true)

**Invokes questions about:**
1. Which environments to support?
2. Should we set up files or just show examples?
3. Any special requirements per environment?

**Output:**
- Config files for each environment (k6-local.json, k6-staging.json, etc.)
- Example script using environment-specific configuration
- .env.example template
- Usage instructions

**Examples**:
- `/k6.config environments=local,dev,staging,prod`
- `/k6.config environments=staging,prod setup=true`
- `/k6.config setup=false` (just examples, no file creation)

</grammar>

<examples>

## Example 1: Complete /k6.plan - HTTP Load Test

**Input**: `/k6.plan scenario=load target=https://httpbin.org/get sla=p95<400ms`

**Output**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },  // Ramp up
    { duration: '5m', target: 20 },  // Stay at 20 VUs
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<400'],    // SLA: p95 < 400ms
    'http_req_failed': ['rate<0.01'],      // Error rate < 1%
    'http_reqs': ['rate>10'],              // Min 10 req/s
  },
};

export default function loadScenario() {
  const response = http.get('https://httpbin.org/get', {
    tags: { name: 'httpbin-get' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(1);
}
```

## Example 2: /k6.plan - Stress Test with Aggressive Profile

**Input**: `/k6.plan scenario=stress target=https://api.example.com/users sla=p99<1s profile=aggressive`

**Output**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Quick ramp
    { duration: '3m', target: 200 },   // Stress level
    { duration: '5m', target: 200 },   // Sustained stress
    { duration: '3m', target: 500 },   // Beyond capacity
    { duration: '2m', target: 0 },     // Recovery
  ],
  thresholds: {
    'http_req_duration': ['p(99)<1000'],
    'http_req_failed': ['rate<0.05'],   // Allow 5% errors in stress
    'http_reqs': ['rate>50'],
  },
};

export default function stressScenario() {
  const response = http.get('https://api.example.com/users', {
    tags: { name: 'list-users' },
    timeout: '30s',
  });

  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has data': (r) => r.json('users') !== undefined,
  });

  sleep(0.5);  // Aggressive profile: shorter sleep
}
```

## Example 3: /k6.plan - POST Request with Authentication

**Input**: `/k6.plan scenario=load target=https://api.example.com/orders sla=p95<500ms protocol=http`

**Output**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 30 },
    { duration: '5m', target: 30 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.95'],
  },
};

export default function postAuthScenario() {
  const payload = JSON.stringify({
    product_id: 'prod_123',
    quantity: 2,
    customer_id: `user_${__VU}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_TOKEN',
    },
    tags: { name: 'create-order' },
    timeout: '30s',
  };

  const response = http.post('https://api.example.com/orders', payload, params);

  check(response, {
    'status is 201': (r) => r.status === 201,
    'order created': (r) => r.json('order_id') !== undefined,
  });

  sleep(1);
}
```

## Example 4: /k6.plan - Batch Requests (Parallel HTTP)

**Input**: `/k6.plan scenario=load target=https://api.example.com sla=p99<600ms`

**Output**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 25 },
    { duration: '5m', target: 25 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(99)<600'],
    'http_req_failed': ['rate<0.01'],
  },
};

export default function batchScenario() {
  // Batch requests for better performance
  const responses = http.batch([
    ['GET', 'https://api.example.com/users', null, { tags: { name: 'users' } }],
    ['GET', 'https://api.example.com/products', null, { tags: { name: 'products' } }],
    ['GET', 'https://api.example.com/orders', null, { tags: { name: 'orders' } }],
  ]);

  check(responses[0], {
    'users status is 200': (r) => r.status === 200,
  });

  check(responses[1], {
    'products status is 200': (r) => r.status === 200,
  });

  check(responses[2], {
    'orders status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

## Example 5: /k6.plan - Spike Test

**Input**: `/k6.plan scenario=spike target=https://shop.example.com sla=p95<800ms`

**Output**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },    // Normal load
    { duration: '30s', target: 200 },   // SPIKE!
    { duration: '1m', target: 200 },    // Sustained spike
    { duration: '30s', target: 10 },    // Recovery
    { duration: '1m', target: 10 },     // Normal again
  ],
  thresholds: {
    'http_req_duration': ['p(95)<800'],
    'http_req_failed': ['rate<0.02'],    // Allow slight degradation
  },
};

export default function spikeScenario() {
  const response = http.get('https://shop.example.com', {
    tags: { name: 'homepage' },
    timeout: '30s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'page loads': (r) => r.body.includes('</html>'),
  });

  sleep(1);
}
```

## Example 6: /k6.plan - gRPC Service Test

**Input**: `/k6.plan scenario=load target=grpcbin.test.k6.io:9000 protocol=grpc sla=p95<200ms`

**Output**:
```javascript
import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

const client = new grpc.Client();
client.load(['definitions'], 'hello.proto');

export const options = {
  stages: [
    { duration: '2m', target: 30 },
    { duration: '5m', target: 30 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'grpc_req_duration': ['p(95)<200'],
    'grpc_req_failed': ['rate<0.01'],
  },
};

export default function grpcScenario() {
  client.connect('grpcbin.test.k6.io:9000', {
    plaintext: true,
    timeout: '30s',
  });

  const response = client.invoke('hello.HelloService/SayHello', {
    greeting: 'k6',
  });

  check(response, {
    'status is OK': (r) => r && r.status === grpc.StatusOK,
    'has message': (r) => r && r.message.reply !== undefined,
  });

  client.close();
  sleep(1);
}
```

## Example 7: /k6.plan - Browser Test (k6/browser)

**Input**: `/k6.plan scenario=load target=https://test.k6.io protocol=browser sla=p95<3s`

**Output**:
```javascript
import { browser } from 'k6/browser';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    'browser_web_vital_lcp': ['p(95)<3000'],    // Largest Contentful Paint
    'browser_web_vital_fid': ['p(95)<100'],     // First Input Delay
  },
};

export default async function browserJourneyScenario() {
  const page = browser.newPage();

  try {
    await page.goto('https://test.k6.io', {
      waitUntil: 'networkidle',
      timeout: '30s',
    });

    check(page, {
      'page loaded': page.locator('h1').textContent() !== '',
    });

    await page.locator('a[href="/my_messages.php"]').click();
    await page.waitForSelector('input[name="login"]');

    await page.locator('input[name="login"]').type('admin');
    await page.locator('input[name="password"]').type('123');
    await page.locator('input[type="submit"]').click();

    check(page, {
      'logged in': page.locator('h2').textContent().includes('Welcome'),
    });

  } finally {
    page.close();
  }

  sleep(1);
}
```

## Example 8: /k6.optimize - Threshold Optimization

**Input**: `/k6.optimize script=basic-test.js focus=thresholds`

**Context**: User has a basic script with minimal thresholds

**Output**:
```markdown
## Optimization Recommendations: Thresholds

### Current Issues
- Only 1 threshold defined (http_req_duration)
- No error rate threshold
- No throughput validation
- Missing check success rate

### Recommended Thresholds
```javascript
thresholds: {
  // Response time percentiles
  'http_req_duration': ['p(95)<500', 'p(99)<1000', 'max<5000'],
  
  // Error rate (fail test if > 1% errors)
  'http_req_failed': ['rate<0.01'],
  
  // Throughput validation
  'http_reqs': ['rate>10'],
  
  // Check success rate
  'checks': ['rate>0.95'],
  
  // Per-endpoint thresholds using tags
  'http_req_duration{name:api-login}': ['p(95)<300'],
  'http_req_duration{name:api-data}': ['p(95)<400'],
},
```

### Benefits
- **Fail-fast**: Test stops if SLAs violated
- **Comprehensive**: Covers latency, errors, throughput
- **Granular**: Per-endpoint SLAs via tags
- **Actionable**: Clear pass/fail criteria
```

## Example 9: /k6.validate - Script Validation

**Input**: `/k6.validate script=my-test.js strict=true`

**Context**: Script has issues

**Output**:
```markdown
## Validation Results: my-test.js

### ❌ Errors (Must Fix)
1. **Missing options export**: No `export const options = {}` found
2. **Missing default function**: No `export default function scenarioName() {}` found  
3. **Invalid import**: Cannot import Node.js 'fs' module in k6

### ⚠️ Warnings (Best Practices)
1. **No thresholds defined**: Add SLA enforcement
2. **No checks**: Add functional validation with check()
3. **Sequential requests**: Use http.batch() for parallel requests
4. **Missing tags**: Add request tags for better metrics
5. **No sleep**: Add sleep() to simulate think time

### ✅ Passed
- Valid Goja syntax
- Proper http module import

### Recommended Actions
1. Add options object with stages and thresholds
2. Wrap test logic in `export default function scenarioName() {}`
3. Remove Node.js imports, use k6 modules only
4. Add at least 2 checks for functional validation
5. Add at least 2 thresholds for performance validation
```

## Example 10: /k6.thresholds - Custom Threshold Generation

**Input**: `/k6.thresholds metrics=p95,p99,rate`

**Output**:
```javascript
// k6 Thresholds Configuration
// Add to your options object

thresholds: {
  // Response time - 95th percentile
  'http_req_duration': ['p(95)<500'],
  
  // Response time - 99th percentile
  'http_req_duration': ['p(99)<1000'],
  
  // Error rate - less than 1%
  'http_req_failed': ['rate<0.01'],
  
  // Request rate - minimum throughput
  'http_reqs': ['rate>10'],
  
  // Optional: Per-endpoint thresholds
  // 'http_req_duration{name:critical-api}': ['p(95)<200'],
  // 'http_req_duration{name:standard-api}': ['p(95)<500'],
}
```

## Example 11: /k6.run - Generate Execution Command

**Input**: `/k6.run script=load-test.js env=staging duration=10m vus=100`

**Output**:
```bash
# k6 Run Command for Staging Environment

k6 run \
  --vus 100 \
  --duration 10m \
  --tag environment=staging \
  --out json=results.json \
  --summary-export=summary.json \
  load-test.js

# Alternative: Use cloud execution
# k6 cloud load-test.js

# View results
# k6 inspect results.json
```

## Example 12: Ambiguous /k6.plan - Triggers 3-Question Protocol

**Input**: `/k6.plan scenario=load`

**Agent Action**: Missing `target` and `sla` → Invoke AskUserQuestion

**Tool Call** (Claude):
```json
{
  "questions": [
    {
      "id": "target",
      "text": "What is the target URL or endpoint to test?",
      "required": true
    },
    {
      "id": "sla",
      "text": "What are your performance SLA requirements?",
      "options": [
        "p95 < 300ms (fast API)",
        "p95 < 500ms (standard API)",
        "p99 < 1s (relaxed)",
        "Custom (I'll specify)"
      ],
      "required": true
    },
    {
      "id": "duration",
      "text": "What test duration do you need?",
      "options": ["5 minutes (standard)", "10 minutes", "30 minutes (soak)", "Custom"],
      "required": false
    }
  ]
}
```

**Fallback** (Copilot - no tool):
```markdown
I need to clarify a few details before generating your k6 load test script:

1. **What is the target URL or endpoint?**
   - Example: https://api.example.com/v1/users

2. **What are your performance SLA requirements?**
   - Example options:
     - p95 < 300ms (fast API)
     - p95 < 500ms (standard API)
     - p99 < 1s (relaxed)
     - Custom: (please specify)

3. **What test duration do you need?** (optional - default is 5 minutes)
   - 5 minutes (standard)
   - 10 minutes
   - 30 minutes (soak test)
   - Custom: (please specify)

Please provide these details and I'll generate your k6 script.
```

</examples>

<instructions>

## Workflow for Command Execution

### When User Invokes /k6.plan

1. **Parse Parameters**: Extract all provided parameters
2. **Check Critical Parameters**: Verify `target`, `scenario`, and `sla` are present
3. **If Missing**:
   - Attempt `AskUserQuestion` tool (Claude)
   - OR attempt `ask_user` tool (Gemini)
   - OR emit formatted Markdown questions (Copilot/fallback)
   - WAIT for user response
4. **With Complete Parameters**:
   - Select appropriate protocol handler (HTTP/gRPC/browser)
   - Apply profile defaults (minimal/standard/aggressive)
   - Generate complete k6 script with:
     - Correct imports
     - Options with stages/scenarios and thresholds
     - Default function with proper protocol usage
     - Meaningful checks (min 2)
     - SLA-aligned thresholds (min 2)
5. **Output**: Return complete, executable k6 script

### When User Invokes /k6.optimize

1. **Read Script**: Parse the provided script file
2. **Analyze Based on Focus**:
   - `thresholds`: Check threshold coverage and quality
   - `checks`: Validate check meaningfulness and coverage
   - `scenarios`: Review executor and stage configuration
   - `performance`: Look for http.batch opportunities, optimal sleep
   - `all`: Comprehensive analysis
3. **Output**: Markdown report with:
   - Issues found
   - Specific recommendations
   - Code snippets showing improvements
   - Expected benefits

### When User Invokes /k6.validate

1. **Parse Script**: Read and analyze script structure
2. **Check Required Elements**:
   - Valid imports (k6 modules only)
  - `export const options = {}`
  - `export default function scenarioName() {}`
   - At least 2 checks
   - At least 2 thresholds (if strict=true)
3. **Check Best Practices** (if strict=true):
   - Use of http.batch for parallel
   - Appropriate sleep times
   - Request tagging
   - Error handling
4. **Output**: Validation report with:
   - ❌ Errors (blocking issues)
   - ⚠️ Warnings (best practices)
   - ✅ Passed checks
   - Recommended actions

### When User Invokes /k6.thresholds

1. **Determine Context**: Script file or standalone
2. **Parse Metrics Requested**: p95, p99, rate, custom
3. **Generate Threshold Object**:
   - Include all requested metrics
   - Use appropriate values based on common SLAs
   - Add explanatory comments
   - Show tag-based threshold examples
4. **Output**: JavaScript code snippet ready to paste

### When User Invokes /k6.run

1. **Parse Parameters**: script, env, duration, vus
2. **Build Command**: Construct k6 CLI command with:
   - VUs and duration overrides
   - Environment tags
   - Output formats (json, summary)
3. **Add Environment Context**:
   - Different suggestions for local vs prod
   - Cloud execution option if relevant
4. **Output**: Bash command with comments

## Multi-Agent Adaptability

### Claude Environment
- Use `AskUserQuestion` tool for interactive questions
- Provide structured JSON with question array

### Gemini Environment  
- Use `ask_user` tool for questions
- Ask questions sequentially if needed

### Copilot Environment
- No interactive tools available
- Emit well-formatted Markdown questions
- Wait for user to respond in next message
- Continue after receiving answers

## Quality Assurance

Every generated script must:
- ✅ Be valid Goja JavaScript
- ✅ Include all necessary imports
- ✅ Have options object with stages/scenarios
- ✅ Have default function with test logic
- ✅ Include at least 2 meaningful checks
- ✅ Include at least 2 thresholds aligned with SLA
- ✅ Use appropriate k6 patterns for protocol
- ✅ Follow k6.io best practices
- ✅ Be immediately executable with `k6 run`

## Error Handling

If user request is ambiguous or impossible:
1. Don't guess or make assumptions
2. Ask clarifying questions (3-question protocol)
3. If truly impossible, explain why and suggest alternatives
4. Never generate invalid k6 code

</instructions>
