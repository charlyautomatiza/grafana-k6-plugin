<p align="center">
  <a href="https://www.youtube.com/c/CharlyAutomatiza?sub_confirmation=1"><img alt="YouTube" src="https://img.shields.io/badge/CharlyAutomatiza-Youtube-FF0000.svg" style="max-height: 300px;"></a>
  <a href="https://discord.gg/wwM9GwxmRZ"><img alt="Discord" src="https://img.shields.io/badge/CharlyAutomatiza-Discord-5865F2.svg?style=flat" style="max-height: 300px;"></a>
  <a href="https://x.com/char_automatiza"><img alt="X" src="https://img.shields.io/badge/@char__automatiza-X-000000.svg?style=flat" style="max-height: 300px;"></a>
  <a href="https://www.linkedin.com/in/gautocarlos/"><img alt="LinkedIn" src="https://img.shields.io/badge/Carlos%20Gauto-LinkedIn-0077B5.svg" style="max-height: 300px;"></a>
  <a href="https://charlyautomatiza.tech"><img alt="Website" src="https://img.shields.io/badge/Website-charlyautomatiza.tech-4285F4.svg?style=flat" style="max-height: 300px;"></a>
  <a href="https://dev.to/charlyautomatiza"><img alt="DEV Community" src="https://img.shields.io/badge/CharlyAutomatiza-DEV.to-0A0A0A.svg?style=flat" style="max-height: 300px;"></a>
  <a href="https://www.instagram.com/charlyautomatiza/"><img alt="Instagram" src="https://img.shields.io/badge/CharlyAutomatiza-Instagram-E4405F.svg?style=flat" style="max-height: 300px;"></a>
  <a href="https://www.twitch.tv/charlyautomatiza"><img alt="Twitch" src="https://img.shields.io/badge/CharlyAutomatiza-Twitch-9146FF.svg" style="max-height: 300px;"></a>
</p>

# k6 Performance Testing Skills

> Skills for k6 performance testing with interactive planning, executor selection, script validation, and multi-environment configuration.

## 🎯 Overview

These skills enable Claude to plan, generate, and validate k6 performance testing scripts following official best practices. They provide deterministic recommendations, interactive parameter resolution, and comprehensive support for HTTP, gRPC, and browser testing protocols.

### Key Features

- **🎯 Deterministic Recommendations**: Same inputs always produce identical outputs
- **💬 Interactive Clarification**: Adaptive question flow for target, scenario, SLA, protocol, and critical gaps
- **📊 Protocol Support**: HTTP, gRPC, and k6/browser
- **✅ Best Practices**: Follows official k6.io documentation patterns
- **🔍 Validation**: Built-in script validation and quality checks
- **📝 Self-Contained Skills**: All logic embedded in SKILL.md files
- **🏗️ Standards Compliant**: Follows official Claude Skills specification
- **🔐 Auth-Aware Planning**: Discovery gate for auth mechanism before executable output
- **🧭 Method-Aware HTTP Planning**: Explicit HTTP method confirmation when required
- **🖥️ Dashboard Guidance**: Deterministic recommendation to enable/disable k6 web dashboard

## ⚠️ Architecture Notes

This repository is aligned with the **official Claude Skills specification**.

**Architecture:**
- ✅ **Self-contained SKILL.md files** with all logic embedded
- ✅ **Per-skill references directories** for focused guidance
- ✅ **Simplified plugin.json** with only standard fields (auto-discovery of skills)
- ✅ **Three core skills**: k6-plan, k6-builder, k6-validate
- ✅ **Deterministic recommendations** - same inputs always produce identical outputs

## 🚀 Quick Start

### Installation

#### Via skills.sh (Recommended)
```bash
npx skills add charlyautomatiza/grafana-k6-plugin
```

#### Manual Installation (Claude Desktop)
Clone to a location where Claude can auto-discover:
```bash
git clone https://github.com/charlyautomatiza/grafana-k6-plugin.git ~/claude-skills/grafana-k6
# Claude will auto-detect skills in this directory
```

#### Verification
List available skills:
```bash
npx skills list charlyautomatiza/grafana-k6-plugin
```

### First Test

In Claude, try:

```
/k6-plan scenario=load target=https://httpbin.org/get sla=p95<400ms
```

You should get a complete, actionable test plan with recommendations.

Note: `protocol` is resolved in the interactive flow when needed. If omitted, the skill can ask you to confirm whether the test should use `http`, `grpc`, or `browser`.

## 🚀 First 5 Minutes

Copy and paste these prompts directly in Claude. You do not need to memorize command syntax to get started.

### Plan first (`/k6-plan`)

> I need a practical load test plan for my users API. Keep p95 below 500ms and errors below 1%.

> Help me design a stress test to find the breaking point of my service, ramping safely to high load.

> I need a performance plan for a gRPC service with p99 under 200ms.

> Create a browser-focused performance test plan for my checkout journey and tell me the next best step.

### Build runnable artifacts (`/k6-builder`)

> Generate a runnable k6 script for my product API with thresholds aligned to p95<400ms and error<1%.

> Build a multi-environment setup (dev, staging, prod) with safe env-variable placeholders.

> Create runnable browser scenario artifacts for login and checkout, with clear assumptions.

> I need a gRPC load test script template with auth handled through environment variables.

### Validate scripts (`/k6-validate`)

> Review this k6 script and flag critical issues that could invalidate results.

> Validate whether my thresholds and checks are coherent with the SLA goals.

> Analyze this script for CI safety, flaky patterns, and risky defaults.

> Give me prioritized fixes to make this script production-ready.

## 🌐 Global Language Policy

- If the user's language is explicit, respond in that language.
- If language is not explicit, default to English.
- Keep command names, k6 metric keys, and code identifiers in English.

## 🧱 Standard k6 Workspace Layout

Recommended directory structure for generated test assets:

```text
k6-project/
├── src/
│   ├── scripts/
│   │   ├── smoke.js
│   │   ├── load.js
│   │   └── stress.js
│   ├── data/
│   │   ├── users.csv
│   │   └── payloads.json
│   ├── config/
│   │   ├── thresholds.js
│   │   └── scenarios.js
│   ├── env/
│   │   └── .env.example
│   └── reports/
└── .gitignore
```

Layout rules:
- Keep generated source assets under `src/`.
- Commit `src/env/.env.example` with placeholders only.
- Do not commit runtime env files such as `.env`, `.env.dev`, `.env.staging`, or `.env.prod`.
- Do not commit generated artifacts in `src/reports/`.
- Never store credentials, production tokens, or sensitive internal endpoints in committed fixtures or env templates.

## 📖 Skills Reference

This repository provides a three-skill lifecycle:

### `/k6-plan` - Interactive Test Planning

Create comprehensive k6 performance test plans from requirements. This skill returns textual plans only. Runnable scripts and configuration outputs are handled by `/k6-builder`.

Natural-language examples (copy/paste in Claude):

> Plan a load test for my API with p95 under 400ms and error rate under 1%.

> I need a stress strategy to discover capacity limits safely and progressively.

> Build a gRPC test plan with p99 below 200ms and explain assumptions.

> I want a browser journey performance plan for login and checkout.

> Give me the plan first and then the single next best action.

Deterministic planning gates:
- Adaptive clarification flow for missing `target`, `scenario`, `sla`, and `protocol`
- HTTP method confirmation for endpoint-sensitive HTTP flows
- Auth discovery (none, bearer, API key, basic, mTLS, session)
- Exactly one `Next recommended step` in final output

Project layout guidance:
- Generated project examples should place runnable assets under `src/`
- Env templates may use `src/env/.env.example`
- Generated reports under `src/reports/` are local artifacts and should not be committed

Technical parameters:
- `scenario` (required): Test type - `load`, `stress`, `spike`, `soak`, `smoke`
- `target` (required): URL or endpoint to test
- `sla` (required): Performance requirements (e.g., `p95<500ms,error<1%`)
- `protocol` (resolved in interactive clarification when needed): `http`, `grpc`, `browser`
- `profile` (optional): Load size - `minimal`, `standard`, `aggressive` (default: `standard`)
- `duration` (optional): Test duration override (e.g., `10m`)
- `vus` (optional): Virtual users override (e.g., `50`)

Technical command examples:

```bash
# Basic load test plan
/k6-plan scenario=load target=https://api.example.com sla=p95<300ms

# Aggressive stress test
/k6-plan scenario=stress target=https://api.example.com sla=p99<1s profile=aggressive

# Browser automation plan
/k6-plan protocol=browser target=https://shop.example.com scenario=load sla=p95<2s

# gRPC service test
/k6-plan protocol=grpc target=grpc.example.internal:9000 scenario=load sla=p95<200ms
```

### `/k6-builder` - Runnable Artifact Generation

Generate runnable k6 scripts and environment-ready configuration from a plan or direct requirements.

Natural-language examples (copy/paste in Claude):

> Generate a runnable k6 script for my catalog API with p95 under 400ms.

> Build dev, staging, and prod configuration files using safe placeholders.

> Create browser test artifacts for checkout and include guardrails.

> Build a gRPC load test script with authentication via environment variables.

> Recommend the best executor and give me runnable output directly.

Deterministic generation gates:
- Adaptive clarification flow for missing `target`, `scenario`, `sla`, and `protocol`
- HTTP method confirmation for endpoint-sensitive HTTP flows
- Auth discovery for secure runnable output
- Exactly one `Next recommended step` in final output

Technical parameters:
- `target` (required): URL or endpoint to test
- `scenario` (required): Test type - `load`, `stress`, `spike`, `soak`, `smoke`
- `sla` (required): Performance requirements (e.g., `p95<500ms,error<1%`)
- `protocol` (resolved in interactive clarification when needed): `http`, `grpc`, `browser`
- `profile` (optional): `minimal`, `standard`, `aggressive` (default: `standard`)
- `duration` (optional): Test duration override (e.g., `10m`)
- `vus` (optional): Virtual users override (e.g., `50`)
- `environments` (optional): Comma-separated env list for multi-env config (e.g., `dev,staging,prod`)
- `goal` (optional): Natural language objective to bias executor/config decisions

Technical command examples:

```bash
# Build runnable script from direct requirements
/k6-builder scenario=load target=https://api.example.com sla=p95<300ms

# Build multi-environment config
/k6-builder scenario=load target=https://api.example.com sla=p95<500ms environments=dev,staging,prod

# Build browser scenario artifacts
/k6-builder protocol=browser scenario=load target=https://shop.example.com sla=p95<2s
```

### `/k6-validate` - Script Validation

Validate k6 scripts for best practices, common issues, and performance anti-patterns.

Natural-language examples (copy/paste in Claude):

> Review this k6 script and tell me what would fail in CI.

> Validate thresholds, checks, and scenario configuration against my SLA goals.

> Flag anti-patterns that can bias performance test results.

> Provide a prioritized remediation list for this script.

Technical parameters:
- `script` (required): Path to k6 script file

Technical command examples:

```bash
# Validate a script
/k6-validate script=./load-test.js

# Check best practices
/k6-validate script=./api-test.js
```

## 🎓 Usage Patterns

### Scenario Types Explained

| Scenario | Purpose | Typical Pattern | Use Case |
|----------|---------|-----------------|----------|
| **load** | Standard load testing | Gradual ramp-up, steady state, ramp-down | Validate normal expected traffic |
| **stress** | Find breaking points | Progressive increase beyond capacity | Discover system limits |
| **spike** | Sudden traffic surge | Rapid spike then sustain | Black Friday, viral event |
| **soak** | Long-duration stability | Sustained load over hours | Memory leaks, resource exhaustion |
| **smoke** | Minimal validation | Low VUs, short duration | Quick sanity check |

### Load Profiles

| Profile | VUs | Duration | Purpose |
|---------|-----|----------|---------|
| **minimal** | 1-5 | 30s-1m | Quick smoke test |
| **standard** | 10-50 | 5-10m | Realistic load test |
| **aggressive** | 50-500+ | 10-30m | Stress/capacity test |

### Protocol Selection

- **http**: REST APIs, web services, most common use case
- **grpc**: gRPC services, microservices communication
- **browser**: User journey testing, frontend performance, Web Vitals

## 💡 Interactive Ambiguity Resolution

When you don't provide all required parameters, the skill will ask clarifying questions.

### Example Flow

**Your Command (Incomplete)**:
```
/k6-plan scenario=load
```

**Agent Asks** (via interactive tool or text):
```markdown
I need to clarify a few details before generating your k6 script:

1. **What is the target URL or endpoint?**
   - Example: https://api.example.com/v1/users

2. **What are your performance SLA requirements?**
   - Example options:
     - p95 < 300ms (fast API)
     - p95 < 500ms (standard API)
     - p99 < 1s (relaxed)
     - Custom: (please specify)

3. **Which protocol should this test use?**
  - Options: http, grpc, browser

4. **What test duration do you need?** (optional - default profile applies)
```

**You Answer**:
```
1. https://api.myapp.com/products
2. p95 < 500ms
3. 10 minutes
```

**Agent Generates**: Complete k6 plan and the next step to build runnable artifacts.

## 🏗️ Architecture

This skill follows the **official Claude Skills specification**. Each skill is a self-contained `SKILL.md` file that Claude interprets directly.

```
grafana-k6-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Skill metadata (standard fields only)
├── skills/                  # Self-contained skills
│   ├── k6-plan/
│   │   ├── SKILL.md        # Complete planning logic + examples
│   │   └── references/     # Protocol/load/SLA/data guides
│   ├── k6-builder/
│   │   ├── SKILL.md        # Runnable artifact generation logic
│   │   └── references/     # Executor/load/SLA/protocol/data guides
│   ├── k6-validate/
│   │   ├── SKILL.md        # Validation checklist
│   │   └── references/     # Severity and validation rules
├── LICENSE
└── README.md
```

### How It Works

1. User invokes: `/k6-plan scenario=load target=https://api.example.com sla=p95<400ms`
2. Claude reads `skills/k6-plan/SKILL.md`
3. Claude follows embedded natural language instructions
4. Claude generates response based on rules and examples in SKILL.md
5. No external JavaScript execution occurs

### Key Principles

✅ **SKILL.md is Complete** - Contains all logic as instructions  
✅ **Deterministic** - Same inputs → same outputs  
✅ **Self-Contained** - No external dependencies  
✅ **Example-Driven** - Claude learns from embedded patterns  

❌ **No JS Execution** - Claude doesn't run external .js files  
❌ **No Custom Routing** - Auto-discovery via plugin.json  
❌ **No External Handlers** - Everything in SKILL.md

## 📦 Distribution

This skill is distributed via the skills.sh ecosystem:

```bash
npx skills add charlyautomatiza/grafana-k6-plugin
```

The skill follows the [Agent Skills specification](https://agentskills.io/specification) and is automatically discoverable by Claude.

### Compatibility Status

| Channel | Status | Installation Method |
|---------|--------|-------------------|
| **skills.sh CLI** | ✅ Ready | `npx skills add charlyautomatiza/grafana-k6-plugin` |
| **Claude Desktop** | ✅ Ready | Auto-discovery or manual git clone |
| **Self-Hosted** | ⚠️ Not configured in this repository | Requires additional marketplace catalog setup |

## 🔧 Customization

Skills can be customized by editing the SKILL.md files directly:
- `skills/k6-plan/SKILL.md` - Modify planning logic, rules, or examples
- `skills/k6-builder/SKILL.md` - Adjust runnable generation logic and configuration behavior
- `skills/k6-validate/SKILL.md` - Customize validation rules

Reference materials in each skill's `references/` directory can also be updated to provide additional context for Claude.

## 📚 Reference Guides

Each skill includes local references with validated patterns and implementation details:

- `skills/k6-plan/references/` — protocol patterns, SLA defaults, load profiles, data integration
- `skills/k6-builder/references/` — executor decision matrix, protocol patterns, SLA defaults, load profiles, and data integration
- `skills/k6-validate/references/` — severity model, threshold/load validation rules, testing guide

## 🧪 Validation

The skill enforces best practices. Every generated script includes:

- ✅ Valid Goja JavaScript syntax
- ✅ Proper imports (k6 modules only)
- ✅ `export let options = {}` configuration
- ✅ `export default function() {}` test logic
- ✅ Minimum 2 meaningful checks
- ✅ Minimum 2 SLA-aligned thresholds
- ✅ Appropriate protocol usage patterns
- ✅ Request tagging for metrics
- ✅ Error handling

## 🛠️ Development

### Testing the Skill

1. Make changes in SKILL.md files (`skills/*/SKILL.md`)
2. Test with Claude by invoking the skill
3. Verify generated scripts with: `k6 run script.js`
4. Check validation with errors or edge cases

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-capability`
3. Make your changes to SKILL.md files or references
4. Test thoroughly with Claude
5. Submit a pull request

## 🔄 Updating

To get the latest repository changes:

```bash
npx skills update charlyautomatiza/grafana-k6-plugin
```

Or manually:
```bash
cd grafana-k6-plugin
git pull origin main
```

## 🗑️ Uninstallation

Remove the skill:

```bash
npx skills remove charlyautomatiza/grafana-k6-plugin
```

## 🐛 Troubleshooting

### Skill not recognized

- Verify installation: `npx skills list`
- Check Claude can access the skills directory
- Restart Claude Desktop app
- For manual installation, verify path is in Claude's skill discovery locations

### Generated scripts have errors

- Run `/k6-validate script=your-script.js` for diagnostics
- Ensure you're using latest k6 version: `k6 version`
- Check k6 documentation for protocol-specific requirements

### Interactive questions not asking

- Ensure you've omitted required parameters (target, scenario, sla, or protocol)
- Check Claude version supports interactive tools
- Try providing more context in your request

## 📖 Resources

### k6 & Grafana
- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Community](https://community.k6.io/)
- [Grafana Cloud k6](https://grafana.com/products/cloud/k6/)

### Skills Distribution
- [skills.sh](https://skills.sh) - Agent Skills ecosystem
- [Agent Skills Specification](https://agentskills.io/specification) - Format specification
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins) - Plugin documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**charlyautomatiza**
- GitHub: [@charlyautomatiza](https://github.com/charlyautomatiza)
- Repository: [grafana-k6-plugin](https://github.com/charlyautomatiza/grafana-k6-plugin)

## 🙏 Acknowledgments

- [Grafana k6](https://grafana.com/oss/k6/) for the excellent performance testing tool
- k6 community for best practices and patterns
- AI agent platforms for enabling skill extensibility

---

**Happy Performance Testing! 🚀**
