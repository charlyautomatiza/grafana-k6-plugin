# k6 Performance Testing Skill

> Multi-agent k6 performance testing skill with deterministic script generation and interactive ambiguity resolution for HTTP, gRPC, and browser testing.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/charlyautomatiza/grafana-k6-skill)
[![k6](https://img.shields.io/badge/k6-compatible-yellowgreen.svg)](https://k6.io)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Overview

This skill enables AI agents (Claude, GitHub Copilot, Gemini) to generate, optimize, and validate k6 performance testing scripts following official best practices. It provides deterministic output, interactive parameter resolution, and comprehensive support for HTTP, gRPC, and browser testing protocols.

### Key Features

- **🤖 Multi-Agent Support**: Works with Claude, GitHub Copilot, and Gemini
- **🎯 Deterministic Generation**: Same inputs always produce identical outputs
- **💬 Interactive Clarification**: 3-question protocol for resolving ambiguities
- **📊 Protocol Support**: HTTP, gRPC, and k6/browser
- **✅ Best Practices**: Follows official k6.io documentation patterns
- **🔍 Validation**: Built-in script validation and optimization
- **📝 Comprehensive Examples**: 5+ examples per command for learning

## 🚀 Quick Start

### Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/charlyautomatiza/grafana-k6-skill.git
   cd grafana-k6-skill
   ```

2. **Run the installation script**:
   ```bash
   ./install.sh
   ```

3. **Verify installation**:
   ```bash
   # Check that files were linked/copied
   ls -la ~/.claude/skills/k6-core
   ls -la ~/.copilot/skills/k6-core
   ```

### Manual Installation

If the automatic installer doesn't work for your setup:

```bash
# For Claude
mkdir -p ~/.claude/skills ~/.claude/plugins
ln -s $(pwd)/skills/k6-core ~/.claude/skills/k6-core
ln -s $(pwd)/.claude-plugin ~/.claude/plugins/grafana-k6-skill

# For Copilot
mkdir -p ~/.copilot/skills ~/.copilot/agents
ln -s $(pwd)/skills/k6-core ~/.copilot/skills/k6-core
ln -s $(pwd)/.claude-plugin ~/.copilot/agents/grafana-k6-skill

# For Gemini
mkdir -p ~/.agents/skills
ln -s $(pwd)/skills/k6-core ~/.agents/skills/k6-core
```

### First Test

In your AI agent interface, try:

```
/k6.plan scenario=load target=https://httpbin.org/get sla=p95<400ms
```

You should get a complete, executable k6 script!

## 📖 Commands Reference

All commands follow the format: `/k6.[action] [param]=[value]`

### `/k6.plan` - Generate Test Script

Create a k6 test script from requirements.

**Parameters**:
- `scenario` (required): Test type - `load`, `stress`, `spike`, `soak`, `smoke`
- `target` (required): URL or endpoint to test
- `sla` (required): Performance requirements (e.g., `p95<500ms`)
- `profile` (optional): Load size - `minimal`, `standard`, `aggressive` (default: `standard`)
- `protocol` (optional): Protocol type - `http`, `grpc`, `browser` (default: `http`)
- `duration` (optional): Test duration override (e.g., `10m`)
- `vus` (optional): Virtual users override (e.g., `50`)

**Examples**:
```bash
# Basic HTTP load test
/k6.plan scenario=load target=https://api.example.com sla=p95<300ms

# Aggressive stress test
/k6.plan scenario=stress target=https://test.com sla=p99<1s profile=aggressive

# Browser automation test
/k6.plan protocol=browser target=https://shop.example.com scenario=load

# gRPC service test
/k6.plan protocol=grpc target=grpcbin.test.k6.io:9000 scenario=load sla=p95<200ms
```

### `/k6.optimize` - Optimize Existing Script

Analyze and improve a k6 script for performance and best practices.

**Parameters**:
- `script` (required): Path to k6 script file
- `focus` (optional): Optimization area - `thresholds`, `checks`, `scenarios`, `performance`, `all` (default: `all`)

**Examples**:
```bash
# Optimize all aspects
/k6.optimize script=test.js

# Focus on thresholds only
/k6.optimize script=load-test.js focus=thresholds

# Improve check coverage
/k6.optimize script=api-test.js focus=checks
```

### `/k6.validate` - Validate Script

Check k6 script for syntax, structure, and best practices compliance.

**Parameters**:
- `script` (required): Path to k6 script file
- `strict` (optional): Enable strict validation - `true`, `false` (default: `true`)

**Examples**:
```bash
# Full validation with best practices
/k6.validate script=my-test.js

# Basic syntax check only
/k6.validate script=api-test.js strict=false
```

### `/k6.thresholds` - Generate Thresholds

Create threshold configurations for SLA enforcement.

**Parameters**:
- `target` (optional): Script or metric name to configure
- `metrics` (optional): Metrics to track - comma-separated: `p95`, `p99`, `rate`, `custom` (default: `p95,p99,rate`)

**Examples**:
```bash
# Generate standard thresholds
/k6.thresholds metrics=p95,p99

# Custom threshold set
/k6.thresholds target=api-test.js metrics=p99,rate
```

### `/k6.run` - Generate Execution Command

Create k6 run command with proper environment and configuration.

**Parameters**:
- `script` (required): Path to k6 script to execute
- `env` (optional): Environment context - `local`, `dev`, `staging`, `prod` (default: `local`)
- `duration` (optional): Test duration override
- `vus` (optional): Virtual users override

**Examples**:
```bash
# Run in staging
/k6.run script=load-test.js env=staging

# Override parameters
/k6.run script=api-test.js duration=5m vus=100 env=prod
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
/k6.plan scenario=load
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

```
grafana-k6-skill/
├── .claude-plugin/
│   └── plugin.json          # Multi-agent metadata & tool declarations
├── skills/
│   └── k6-core/
│       └── SKILL.md         # Main skill logic, rules, & examples
├── examples/                # Sample k6 scripts
│   ├── http/
│   ├── grpc/
│   ├── browser/
│   ├── thresholds/
│   └── scenarios/
├── install.sh               # Installation script
├── README.md               # This file
└── .gitignore
```

## 🔧 Configuration

### Agent Compatibility

| Agent | Interactive Questions | Installation Path | Status |
|-------|----------------------|-------------------|--------|
| **Claude** | ✅ AskUserQuestion tool | `~/.claude/skills/k6-core` | Fully Supported |
| **Copilot** | ⚠️ Text fallback | `~/.copilot/skills/k6-core` | Supported |
| **Gemini** | ✅ ask_user tool | `~/.agents/skills/k6-core` | Supported |

### Customization

Edit `skills/k6-core/SKILL.md` to customize:
- Default load profiles (VUs, duration, stages)
- Threshold values
- Example scripts
- Additional protocols or patterns

Changes propagate immediately if you used symlinks during installation.

## 📚 Examples

See the `examples/` directory for complete, runnable k6 scripts:

### HTTP Examples
- **simple-get.js**: Basic HTTP GET load test
- **post-with-auth.js**: POST with authentication
- **batch-requests.js**: Parallel requests using http.batch

### gRPC Examples
- **basic-service.js**: gRPC service load testing

### Browser Examples
- **user-journey.js**: Complete user flow with k6/browser

### Advanced Examples
- **multi-stage.js**: Complex scenario with multiple stages
- **sla-config.js**: Comprehensive threshold configurations

Run any example:
```bash
k6 run examples/http/simple-get.js
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

### v1.0.0 (2026-03-05)
- Initial release with multi-agent support
- Commands: plan, optimize, validate, thresholds, run
- Protocols: HTTP, gRPC, k6/browser
- Interactive ambiguity resolution with 3-question protocol
- Comprehensive examples and best practices
- Installation script for macOS, Linux, WSL

## 🛠️ Development

### Testing the Skill

1. Make changes to `skills/k6-core/SKILL.md`
2. If using symlinks, changes are immediate
3. Test with your AI agent
4. Verify output with: `k6 run generated-script.js`

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-capability`
3. Make your changes
4. Test with multiple agents if possible
5. Submit a pull request

### Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **Major**: Breaking changes to command grammar or tool schemas
- **Minor**: New commands, protocol support, or non-breaking features
- **Patch**: Bug fixes, documentation, examples

## 🔄 Updating

To update to a new version:

```bash
cd grafana-k6-skill
git pull origin main
./install.sh  # Re-run installer
```

## 🗑️ Uninstallation

Remove the skill from all agents:

```bash
./install.sh --uninstall
```

Or manually:
```bash
rm -rf ~/.claude/skills/k6-core
rm -rf ~/.claude/plugins/grafana-k6-skill
rm -rf ~/.copilot/skills/k6-core
rm -rf ~/.copilot/agents/grafana-k6-skill
rm -rf ~/.agents/skills/k6-core
```

## 🐛 Troubleshooting

### Skill not recognized

- Verify installation: `ls -la ~/.claude/skills/k6-core/SKILL.md`
- Check agent configuration supports custom skills
- For Copilot: May need to restart VS Code
- For Claude: Restart Claude Desktop app

### Generated scripts have errors

- Run `/k6.validate script=your-script.js` for diagnostics
- Ensure you're using latest k6 version: `k6 version`
- Check k6 documentation for protocol-specific requirements

### Interactive questions not working

- Expected for Copilot (uses text fallback)
- For Claude: Ensure using Claude 3.0+
- For Gemini: Check tool support is enabled

## 📖 Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Community](https://community.k6.io/)
- [Grafana Cloud k6](https://grafana.com/products/cloud/k6/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**charlyautomatiza**
- GitHub: [@charlyautomatiza](https://github.com/charlyautomatiza)
- Repository: [grafana-k6-skill](https://github.com/charlyautomatiza/grafana-k6-skill)

## 🙏 Acknowledgments

- [Grafana k6](https://k6.io/) for the excellent performance testing tool
- k6 community for best practices and patterns
- AI agent platforms for enabling skill extensibility

---

**Happy Load Testing! 🚀**
