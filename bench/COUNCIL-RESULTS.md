# council bench v2 — multi-agent orchestration (in-environment)

> Method: run **inside a coding agent** (Claude Code, `haiku` model), via isolated subagents. Each subagent was told NOT to use tools or read files (a pure decision, no codebase exploration that would contaminate the comparison). Compares **single-pass** (one agent decides) vs **council** (N independent personas + a chairman synthesizes).

## The question

Does the multi-persona council deliver a measurable differential over a single pass of the same model? In what?

## Suite v2 — 5 decisions with a SUBTLE flaw

Unlike v1 (textbook flaws: deadlock / N+1 / race, which a single pass kills trivially), v2 uses subtle flaws where a single pass plausibly errs — **plus 1 sound control** (a consciously-accepted trade-off that should NOT be rejected):

| # | decision | type | embedded flaw |
|---|---|---|---|
| S1 | idempotency by content hash (amount + date) | flaw | two legitimate equal payments collide; the key should come from the client |
| S2 | cache a quote with key (customer, product) | flaw | the key omits amount/term → a wrong result is served |
| S3 | notify-then-commit (publish before committing) | flaw | if the commit fails after the publish, the operator is notified but there's no ticket in the queue |
| S4 | OFFSET pagination | flaw | concurrent inserts → skips/duplicates; cursor/keyset fixes it |
| S5 | **UUID v4 as PK (sound trade-off)** | **control** | **none — a legitimate trade-off; rejecting it = over-flag** |

## Result

### Flaw detection — NO headroom

Single-pass haiku caught **4/4** of the subtle flaws (S1–S4), with a correct diagnosis and recommended fix for each. The council would catch them too, but **adds nothing measurable** here: the base model is already too capable in this band. (Same lesson as v1 and the code benchmark: a detection differential is hard to show when the base model is strong.)

### Calibration — differential DEMONSTRATED (the twist)

The new signal is in the **control, S5**:

| condition | cost | verdict on S5 (sound trade-off) | correct? |
|---|---|---|---|
| **naive single-pass** | 1× | **REJECTED** — "use auto-increment" | ❌ over-flag |
| **single-pass self-debate** | 1× | **REJECTED** — "premature optimization" | ❌ over-flag |
| **council** (4 personas + chairman) | 5× | **APPROVED with caveats** | ✅ calibrated |

Council personas on S5: `executor` approved (KISS, industry standard), `expansionist` approved (unlocks sharding / client-side ID generation), `architecture` approved with caveats (document immutability + add `created_at` + index perf test), `contrarian` raised risks but proposed a **hybrid** (UUID for public domains / int for the hot core) — didn't veto. The **chairman** synthesized: **APPROVE**, absorbing the contrarian's mitigation as a residual risk instead of blocking.

**The decisive test (what justifies the 5×):** I tried to replicate the calibration at 1× cost — a single agent told to **steelman both sides** AND ask explicitly "is this a consciously-accepted trade-off?". It **still rejected** (over-flag). The risk-aversion that drives the naive rejection **also drives the decision step** of the self-debate — a single context has one voice; arguing with itself doesn't escape its own prior. The council works because each persona **commits** to a distinct objective function (executor = KISS, expansionist = future optionality) and the chairman aggregates genuine commitments, not one model's hedge.

**The reading:** the council's differential isn't catching more flaws (single-pass goes 4/4) — it's **avoiding the false block (over-flag) on a conscious trade-off**, and that specific differential **resisted cheap replication**. It's the one dimension where 5× bought something 1× couldn't.

## Additional sound controls — n=4 (solid signal)

To move past N=1, I ran 3 more legitimate trade-offs (approve = right; reject = over-flag), each across the 3 conditions:

| sound trade-off | naive 1× | self-debate 1× | council 5× |
|---|---|---|---|
| S5 · UUID v4 as PK | REJECT ❌ | REJECT ❌ | APPROVE ✅ |
| C1 · read replica with ~5s lag | APPROVE ✅ | APPROVE ✅ | APPROVE ✅ |
| C2 · denormalize `customer_name` into `orders` | APPROVE ✅ | **REJECT ❌** | APPROVE ✅ |
| C3 · try/except around an accessory notify | APPROVE ✅ | APPROVE ✅ | APPROVE ✅ |
| **over-flag rate (lower = better)** | **1/4** | **2/4** | **0/4** |

Three findings, all honest:

1. **Council 0/4 — perfect calibration on the sound ones.** Never blocked a legitimate trade-off. Vindicates the S5 differential at a larger n.
2. **The single-pass over-flag is real but intermittent (naive 1/4).** It depends on how *dogma-charged* the trade-off is: UUID-vs-int (S5) is a holy-war topic → over-flag. Read replica (C1) and try/except-accessory (C3) are low-dogma → they passed. Denormalization (C2) is charged → naive got it right, but self-debate tripped.
3. **The cheap fix (self-debate) makes it WORSE, not better (2/4).** Telling the model to "argue both sides" in a single context **surfaced more objections** and pushed it toward rejection (C2: naive approved, self-debate rejected). You can't *talk* a single model out of over-flagging — it needs perspectives that genuinely **commit**. That strengthens the case that calibration requires the multi-agent structure, not more deliberation.

## Conclusion (n=4)

The council **isn't bloat** on the calibration axis: **0/4** over-flag vs naive **1/4** vs self-debate **2/4**, and the cheap alternative **degrades** instead of replicating. But the **magnitude is modest**: the naive single-pass only errs on ~1 in 4 sound trade-offs, and only on the *dogma-charged* ones. Operational translation:

> The council pays its 5× **only** when the decision is (a) ambiguous / dogma-charged AND (b) the cost of a false block is high (killing a legitimate trade-off = rework, imposed over-engineering, delay). Otherwise — flaw detection, clear decisions, low-controversy trade-offs — it's waste. This reinforces the manifest's boundary (council only in planning/escalation) and suggests narrowing it further: *ambiguous, controversial architectural trade-offs*, not every planning decision.

**Caveat kept:** decisions in **isolation** (no tools/codebase) maximize the over-flag signal; in a real planning session, project context may recalibrate the single pass. And "approve = right" on the 4 controls is my own judgment as the author — but all 4 are uncontroversially sound trade-offs.

## Cost

- single-pass: ~82k tokens / decision.
- council (4 personas + chairman): ~412k tokens / decision (**~5×**).

The calibration value only pays 5× on **high-risk, ambiguous decisions** where a false block is expensive (rework, imposed over-engineering, lost opportunity). On a trivial or clearly-wrong decision, the single pass is enough — which is why the manifest invokes the council **only in planning/escalation**, not per turn.

## Honest caveats

- **N=1 control** (originally): the "corrected over-flag" was a single point; the n=4 controls above turn the *direction* (council value = anti-over-flag calibration) into a solid signal, not a quantified rate.
- **Capable model** (haiku): on a weaker model, the council would probably recover *also* in detection, not just calibration.
- An isolated decision (no tools) is the clean test of deliberation; on a real task, codebase exploration changes the game.

**Real deliverable:** an honest confirmation that council orchestration has a **specific, localizable** differential (calibration / anti-over-flag on high-risk ambiguous decisions), distinct from the verification gate (which catches implementation errors). The two cover different failures — they don't compete.
