# spec-agent

> **Stop letting your coding agent ship broken code.** `spec-agent` adds verification gates, project rules, and durable learning to **Claude Code, Copilot, Cursor, and Codex** — without replacing your agent. Install via `npx`.

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/@marcusbarcelos/spec-agent.svg)](https://www.npmjs.com/package/@marcusbarcelos/spec-agent)

It's not another prompt framework. It's the **governance layer** that's left when the model is already capable: a deterministic gate that blocks what the model can't see, project rules it actually applies, and a learning loop that turns recurring mistakes into durable, reusable knowledge — running inside the agent you already use.

---

## See it work

The agent says "done." The gate says "not yet." It's a deterministic checkpoint between your agent finishing and the code landing — not a prompt.

```
agent finishes a change
        │
        ▼
  spec-agent gate  ──  lint · typecheck · tests · project invariants
        │
   ┌────┴─────┐
 pass        fail
   │           │
 ✓ lands   error handed back to the agent ─→ agent fixes ─→ gate re-runs
```

A concrete before/after — your project's invariant is "each whitespace becomes one dash":

```diff
  // the agent's final diff — looks fine, ships wrong:
- const slug = name.trim().replace(/\s+/g, "-")   // "a  b" → "a-b"  ✗ collapses runs

  // spec-agent gate:
  //   ✗ FAILED — slug: whitespace invariant — finish blocked, error returned to the agent

  // the agent re-runs and corrects it:
+ const slug = name.trim().replace(/\s/g, "-")    // "a  b" → "a--b"  ✓
  //   ✓ gate passed — change can land
```

Without spec-agent, that first diff ships. The agent thought it was done; the gate disagreed — and the agent fixed it before you ever saw the PR.

## Quickstart

```bash
# scaffold .spec/ + adapters into the current repo
npx @marcusbarcelos/spec-agent init --id my-project --agents claude,agents-md

# re-project adapters when the engine evolves (never touches your durable state)
npx @marcusbarcelos/spec-agent sync

# add an agent later (re-projects everything, preserves your durable state)
npx @marcusbarcelos/spec-agent sync --agents copilot
```

Requires Node ≥ 20.

## What's inside

| Mechanism | What it does | Priority |
|---|---|---|
| **verification gate** | A deterministic Stop-hook that blocks "done" while lint/typecheck/tests fail on what was touched. Catches the error the model can't see in itself. | **core — clearest ROI** |
| **project learning & skill-forge** | Turns a recurring project mistake into an imperative, reusable rule the model actually applies — where, without it, it *knows the rule and breaks it anyway*. | **the long-term differentiator** |
| **context-economy** | Token discipline in prompt, tool input, and output. A code graph instead of re-reading files. | core |
| **agent-council** | Multi-perspective review reserved for **high-risk, ambiguous calls** (DB migrations, contract breaks, security, architecture). Not for everyday turns. | advanced |

### skill-forge — durable learning, in action

```diff
  // without the learned rule — the model even cites it, then breaks it:
- const d = dto.expirationDate ?? dto.expiration_date   // defensive fallback, violates the project rule

  // with the skill in context:
+ const d = dto.expirationDate                          // fix the type at the source, no fallback
```

## What we measured

A small, reproducible, **tamper-isolated** benchmark (the agent never sees the checkers). It's a **method plus a first signal**, not proof — small N, stated openly.

- **The gate is the concrete win.** It recovered an objective failure the model shipped — targeted tasks went **80% → 100%** via the fix-loop. Prompt rules alone moved ~0 on a capable model.
- **Durable knowledge changes behavior.** A learned project rule flipped a wrong answer to right — the model knew the rule and violated it without the skill.
- **Council's niche is calibration.** On ambiguous-but-sound trade-offs it never false-blocked (**0/4**), where a single pass did. Real, but narrow — hence "advanced."

> With a capable base model, the differential shows at the margins — in the objective gate and durable project knowledge, not in expensive orchestration by default.

Full method, numbers, and caveats: [RESULTS](./bench/RESULTS.md) · [SKILLFORGE-RESULTS](./bench/SKILLFORGE-RESULTS.md) · [COUNCIL-RESULTS](./bench/COUNCIL-RESULTS.md). Small N — indicative, not statistical proof.

## thin + sync model

The **engine** (rules + governance skills) ships inside the package. Your repo only holds:

- the **adapters** per agent (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`) — marked `GENERATED`, regenerable;
- the engine's skills in the agent's native location (`.claude/skills/`) where supported;
- your project's **durable state** in `.spec/` (`manifest.yaml`, `learning/`, `skills/`).

`sync` re-projects the adapters from the updated engine and **never** touches `.spec/learning/` or `.spec/skills/` — the knowledge you accumulate is yours.

```
your-repo/
├─ CLAUDE.md                       # GENERATED adapter (Claude Code)
├─ AGENTS.md                       # GENERATED adapter (Codex / generic)
├─ .github/copilot-instructions.md # GENERATED adapter (Copilot)
├─ .claude/skills/                 # engine skills, in the agent's native location
└─ .spec/                          # YOUR durable state (sync never touches)
   ├─ manifest.yaml
   ├─ learning/                    # lessons, pitfalls, patterns, glossary, _pending/
   └─ skills/                      # skills generated by skill-forge
```

## Works with your agent (honest loss-model)

Full harness on Claude Code; on other agents it runs **degraded-but-functional**, with the gaps written down in the manifest's `loss_report`.

| capability | Claude Code | other agents |
|---|---|---|
| verification gate | Stop hook | git pre-commit / CI |
| durable learning | native skills + memory | `.spec/learning/` |
| multi-agent (council) | native subagents | single-thread simulation |
| code graph | graphify CLI | graphify CLI |

Agent-specific enhancers (claude-mem, superpowers, rtk, graphify) are optional — never dependencies.

## Status

**v1** — `init` / `sync` (Claude Code / AGENTS.md / Copilot) + reproducible benchmark + landing page. See [`examples/hello-project/`](./examples/hello-project/) for a scaffolded tree.

**Roadmap** — Cursor / Codex / Gemini adapters; auto-promotion of `_pending` → `learning`; proof on larger real repos (TS + tests, Python + mypy/pytest).

## License

[MIT](./LICENSE) © 2026 Marcus Vinicius Barcelos
