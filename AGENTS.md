# AGENTS.md

## 1. Purpose & Scope
This file is the operating manual for AI coding agents working in this repository.
Use it to make consistent, safe, and testable changes to the skills library.
Primary repo goal: build and evolve reusable AI skills for k6 planning, artifact generation, and validation.
Primary audience: coding agents (Claude, Cursor, Copilot, Grok, and similar).

## 2. Repository Snapshot
Core folders:
- `skills/k6-plan/`: planning skill for deterministic k6 test plans.
- `skills/k6-builder/`: implementation skill for runnable k6 artifacts.
- `skills/k6-validate/`: validation skill for script quality and safety checks.
- `scripts/`: auxiliary repository scripts when needed.

Operating model:
- Skills are instruction-driven via `SKILL.md` files.
- `references/` subfolders provide deeper domain guidance per skill.
- Iterative quality improvements are tracked in evaluation artifacts.

## 3. Operating Principles
### Think Before Coding
- State assumptions explicitly before implementing.
- If multiple interpretations exist, surface them instead of silently choosing one.
- Prefer a simpler approach when it solves the request.
- Stop and ask when ambiguity blocks correctness.

### Simplicity First
- Implement the minimum solution that satisfies the request.
- Do not add speculative flexibility, config, or abstractions.
- Avoid overengineering; simplify aggressively when possible.

### Surgical Changes
- Touch only the files and lines needed for the request.
- Match existing style and conventions.
- Do not refactor unrelated code.
- Remove only the unused code created by your own changes.

### Goal-Driven Execution
- Translate requests into verifiable success criteria.
- For multi-step work, define steps and a validation check per step.
- Iterate until checks pass or blockers are explicit.

## 4. Skill Architecture Standard
Each skill must be self-contained and predictable.

Required structure:
- `skills/<skill-name>/SKILL.md`
- `skills/<skill-name>/references/` with focused support docs

`SKILL.md` baseline:
- YAML frontmatter with `name`, `description`, `license`, and metadata.
- Clear trigger language in `description` using “Use when...”.
- Deterministic workflow instructions and explicit output contract.
- Tool/fallback behavior when required inputs are missing.

## 5. Skill Lifecycle Workflow
Default lifecycle in this repository:
1. Plan with `k6-plan`.
2. Build runnable artifacts with `k6-builder`.
3. Validate quality and safety with `k6-validate`.

Lifecycle rules:
- Preserve semantic continuity across plan, build, and validate outputs.
- Keep thresholds, scenario intent, and protocol expectations aligned.
- Always include a clear next step for downstream execution.

## 6. How to Create a New Skill
Use this checklist:
1. Define a narrow, high-value capability.
2. Create a concise `description` with strong trigger phrases.
3. Add frontmatter metadata and version.
4. Define required inputs, clarification logic, and fallback behavior.
5. Specify deterministic output sections in fixed order.
6. Add a `references/README.md` and focused support docs.
7. Include at least 3 invocation examples and one edge-case example.
8. Define quality invariants and explicit handoff to adjacent skills.

## 7. How to Iterate Existing Skills
Iteration loop:
1. Detect a concrete failure mode from eval outputs.
2. Apply the smallest change that fixes the failure.
3. Re-run evaluation and compare against previous iteration.
4. Keep improvements that raise reliability without regressions.

Iteration rules:
- Change one concern at a time when possible.
- Do not alter output contracts without strong justification.
- Document assumption changes directly in `SKILL.md` where behavior changes.
- Prioritize deterministic behavior over stylistic rewrites.

## 8. Quality & Testing Standards
Minimum quality expectations:
- Strong pass rate against skill-specific assertions.
- Clear advantage versus baseline (without skill) behavior.
- Stable behavior across repeated runs.
- Coverage of edge cases and ambiguity handling.

Evaluation artifacts to maintain:
- `grading.json`, `response.txt`, `timing.json`, `benchmark.json`.

Scoring model used in this repo:
- `Score = (PassRate * 0.40) + (Advantage * 0.30) + (Consistency * 0.20) + (EdgeCoverage * 0.10)`

## 9. Hard Boundaries (Do Not Cross)
- Do not silently invent missing requirements.
- Do not reorder mandatory output contract sections.
- Do not add hidden side effects or undocumented behavior.
- Do not introduce secrets, credentials, or hardcoded sensitive values.
- Do not make broad refactors for narrow tasks.
- Do not commit changes under `docs/` in this repository.

## 10. Commit Scope Rules
Commit policy for agent work:
- Keep commits scoped to the user request.
- Ensure every changed line is traceable to an explicit goal.
- Prefer one logical change set per commit.
- Include verification evidence in PR notes or commit message context.

Recommended branch naming:
- `docs/add-agents-md` for this change.
- `chore/<area>-<intent>` for maintenance.
- `feat/<area>-<capability>` for behavior additions.

Before finalizing:
- Confirm file scope, line scope, and requirement coverage.
- Confirm output language is English.
- Confirm the document remains concise and actionable.