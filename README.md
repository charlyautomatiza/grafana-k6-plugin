# k6 Performance Testing Skill

> Claude Skills for k6 performance testing with interactive planning, executor selection, script validation, and multi-environment configuration.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/charlyautomatiza/grafana-k6-skill)
[![k6](https://img.shields.io/badge/k6-compatible-yellowgreen.svg)](https://k6.io)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Overview

This skill enables Claude to plan, generate, and validate k6 performance testing scripts following official best practices. It provides deterministic recommendations, interactive parameter resolution, and comprehensive support for HTTP, gRPC, and browser testing protocols.

### Key Features

- **🎯 Deterministic Recommendations**: Same inputs always produce identical outputs
- **💬 Interactive Clarification**: 3-question protocol for resolving ambiguities
- **📊 Protocol Support**: HTTP, gRPC, and k6/browser
- **✅ Best Practices**: Follows official k6.io documentation patterns
- **🔍 Validation**: Built-in script validation and quality checks
- **📝 Self-Contained Skills**: All logic embedded in SKILL.md files
- **🏗️ Standards Compliant**: Follows official Claude Skills specification

## ⚠️ v0.1.0 Initial Release

Version 0.1.0 is the initial release with architecture aligned to the **official Claude Skills specification**. 

**Architecture**:
- ✅ **Self-contained SKILL.md files** with all logic embedded
- ✅ **Per-skill references directories** for focused guidance
- ✅ **Simplified plugin.json** with only standard fields (auto-discovery of skills)
- ✅ **Four core skills**: k6-plan, k6-executor, k6-config, k6-validate
- ✅ **Deterministic recommendations** - same inputs always produce identical outputs

**Why 0.1.0?**:
No production code uses this yet. This is the initial stable release following the official Claude Skills specification. All APIs and skill behaviors may evolve as we gather real-world usage feedback.

## 🚀 Quick Start

### Installation

#### Via skills.sh (Recommended)
```bash
npx skills add charlyautomatiza/grafana-k6-skill
```

#### Manual Installation (Claude Desktop)
Clone to a location where Claude can auto-discover:
```bash
git clone https://github.com/charlyautomatiza/grafana-k6-skill.git ~/claude-skills/grafana-k6
# Claude will auto-detect skills in this directory
```

#### Verification
List available skills:
```bash
npx skills list charlyautomatiza/grafana-k6-skill
```

### First Test

In Claude, try:

```
/k6-plan scenario=load target=https://httpbin.org/get sla=p95<400ms
```

You should get a complete, actionable test plan with recommendations.

## 📖 Skills Reference

This skill provides four self-contained skills:

### `/k6-plan` - Interactive Test Planning

Create comprehensive k6 performance test plans from requirements. Generates textual plans by default, or complete scripts when explicitly requested.

**Parameters**:
- `scenario` (required): Test type - `load`, `stress`, `spike`, `soak`, `smoke`
- `target` (required): URL or endpoint to test
- `sla` (required): Performance requirements (e.g., `p95<500ms,error<1%`)
- `profile` (optional): Load size - `minimal`, `standard`, `aggressive` (default: `standard`)
- `protocol` (optional): Protocol type - `http`, `grpc`, `browser` (default: `http`)
- `duration` (optional): Test duration override (e.g., `10m`)
- `vus` (optional): Virtual users override (e.g., `50`)
- `output` (optional): Set to `script` to generate executable k6 code

**Examples**:
```bash
# Basic HTTP load test plan
/k6-plan scenario=load target=https://api.example.com sla=p95<300ms

# Aggressive stress test
/k6-plan scenario=stress target=https://test.com sla=p99<1s profile=aggressive

# Browser automation plan
/k6-plan protocol=browser target=https://shop.example.com scenario=load sla=p95<2s

# gRPC service test
/k6-plan protocol=grpc target=grpcbin.test.k6.io:9000 scenario=load sla=p95<200ms

# Generate executable script
/k6-plan scenario=load target=https://api.example.com sla=p95<300ms output=script
```

### `/k6-executor` - Executor Selection Guide

Get recommendations for the optimal k6 executor type based on your test goals.

**Parameters**:
- `goal` (required): What you want to test (e.g., "validate 500 RPS sustained")

**Examples**:
```bash
# Clear goal
/k6-executor goal=validate we can handle 500 requests per second

# Baseline testing
/k6-executor goal=baseline testing with 50 concurrent users

# Find capacity limits
/k6-executor goal=find the breaking point of our API
```

### `/k6-validate` - Script Validation

Validate k6 scripts for best practices, common issues, and performance anti-patterns.

**Parameters**:
- `script` (required): Path to k6 script file

**Examples**:
```bash
# Validate a script
/k6-validate script=./load-test.js

# Check best practices
/k6-validate script=./api-test.js
```

### `/k6-config` - Multi-Environment Configuration

Generate environment-specific k6 configurations with best practices for secrets management.

**Parameters**:
- `environments` (required): Comma-separated list of environments (e.g., `dev,staging,prod`)

**Examples**:
```bash
# Generate configs for all environments
/k6-config environments=dev,staging,prod

# Development and production only
/k6-config environments=dev,prod
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

3. **What test duration do you need?** (optional - default is 5 minutes)
```

**You Answer**:
```
1. https://api.myapp.com/products
2. p95 < 500ms
3. 10 minutes
```

**Agent Generates**: Complete k6 script with your specifications!

## 🏗️ Architecture

This skill follows the **official Claude Skills specification**. Each skill is a self-contained `SKILL.md` file that Claude interprets directly.

```
grafana-k6-skill/
├── .claude-plugin/
│   ├── plugin.json          # Skill metadata (standard fields only)
├── skills/                  # Self-contained skills
│   ├── k6-plan/
│   │   ├── SKILL.md        # Complete planning logic + examples
│   │   └── references/     # Protocol/load/SLA/data guides
│   ├── k6-executor/
│   │   ├── SKILL.md        # Executor selection guide
│   │   └── references/     # Decision matrix and support docs
│   ├── k6-validate/
│   │   ├── SKILL.md        # Validation checklist
│   │   └── references/     # Severity and validation rules
│   └── k6-config/
│       ├── SKILL.md        # Multi-env configuration
│       └── references/     # Config/load/SLA/data guides
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
npx skills add charlyautomatiza/grafana-k6-skill
```

The skill follows the [Agent Skills specification](https://agentskills.io/specification) and is automatically discoverable by Claude.

### Compatibility Status

| Channel | Status | Installation Method |
|---------|--------|-------------------|
| **skills.sh CLI** | ✅ Ready | `npx skills add charlyautomatiza/grafana-k6-skill` |
| **Claude Desktop** | ✅ Ready | Auto-discovery or manual git clone |
| **Self-Hosted** | ⚠️ Not configured in this repository | Requires additional marketplace catalog setup |

## 🔧 Customization

Skills can be customized by editing the SKILL.md files directly:
- `skills/k6-plan/SKILL.md` - Modify planning logic, rules, or examples
- `skills/k6-executor/SKILL.md` - Adjust executor recommendations
- `skills/k6-validate/SKILL.md` - Customize validation rules
- `skills/k6-config/SKILL.md` - Change configuration patterns

Reference materials in each skill's `references/` directory can also be updated to provide additional context for Claude.

## 📚 Reference Guides

Each skill includes local references with validated patterns and implementation details:

- `skills/k6-plan/references/` — protocol patterns, SLA defaults, load profiles, data integration
- `skills/k6-executor/references/` — executor decision matrix and profile guidance
- `skills/k6-validate/references/` — severity model, threshold/load validation rules, testing guide
- `skills/k6-config/references/` — environment configuration patterns and defaults

Generate a runnable script via skill command:
```bash
/k6-plan scenario=load target=https://api.example.com sla=p95<300ms output=script
```

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

## 📦 Version History

### v0.1.0 (2026-03-07)
- Initial pre-release following official Claude Skills specification
- Self-contained SKILL.md files with embedded logic
- References directory for examples and documentation
- Installation via npx skills add
- Simplified plugin.json (standard fields only)
- Protocols: HTTP, gRPC, k6/browser
- Interactive ambiguity resolution with 3-question protocol
- Deterministic recommendations for k6 performance testing

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

### Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **Major**: Breaking changes to skill invocation or output format
- **Minor**: New skills or non-breaking features
- **Patch**: Bug fixes, documentation, examples

## 🔄 Updating

To update to a new version:

```bash
npx skills update charlyautomatiza/grafana-k6-skill
```

Or manually:
```bash
cd grafana-k6-skill
git pull origin main
```

## 🗑️ Uninstallation

Remove the skill:

```bash
npx skills remove charlyautomatiza/grafana-k6-skill
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

- Ensure you've omitted required parameters (target, scenario, or sla)
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
- Repository: [grafana-k6-skill](https://github.com/charlyautomatiza/grafana-k6-skill)

## 🙏 Acknowledgments

- [Grafana k6](https://grafana.com/oss/k6/) for the excellent performance testing tool
- k6 community for best practices and patterns
- AI agent platforms for enabling skill extensibility

---

**Happy Load Testing! 🚀**
