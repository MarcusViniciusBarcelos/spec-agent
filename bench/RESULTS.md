# spec-agent bench — first run (in-environment)

> Method: run **inside a coding agent** (Claude Code, `haiku` model), via subagents. 9 tasks × 3 conditions, N=1. Tamper-isolated ground truth (`bench/check.js` — the subagent never sees the checker). Optimization: the `rules-only` result serves as the first attempt for `full-harness` (the gate is additive).

| condition | success rate | tokens/task | gate-catch | n |
|---|---|---|---|---|
| baseline | 89% ±31% | 82182 ±19 | 0% | 9 |
| rules-only | 89% ±31% | 82289 ±19 | 0% | 9 |
| full-harness | 100% ±0% | 91438 ±25884 | 11% | 9 |

**Targeted vs control split (success rate):**
- control (3 trivial tasks): 100% / 100% / 100%
- targeted (5 tasks with a footgun): 80% / 80% / **100%**

## Honest reading

- **Rules (prompt) alone did not move the first attempt** on this model/suite (+0pp, +0.1% tokens). Haiku already solved 8/9; only one footgun tripped (`slug`: collapsed runs of spaces with `\s+` instead of `\s`).
- **The measurable value is in the gate**: it caught the one failure (targeted `slug`) and the fix recovered it → **80% → 100% on the targeted tasks** (+11pp aggregate), at the cost of **+11% tokens** (the caught task runs twice).
- **Controls unchanged** (100% across all three conditions) — the harness doesn't "help" where it shouldn't. That's what shows the benchmark **isn't rigged** in the harness's favor.
- **Tokens dominated by fixed agent overhead** (~82k base): the harness's prompt addition is invisible in the total; only the gate's fix-loop shows up.

## Caveats (what a larger run would change)

- **N=1**: indicative, not proof. More runs would give real variance.
- **Capable model** (haiku): few footguns tripped. A weaker model or harder tasks would expose the rules' differential more.
- v1 measures the harness at the **prompt + gate** level; full orchestration (multi-agent council, longitudinal skill-forge) is v2.

**The real deliverable is the method**: an honest, reproducible, tamper-isolated benchmark that runs inside the coding agent itself — and the first signal points to the verification gate as the concrete differential.
