# Demo — the gate blocks a real bug (≈30s)

> **Done should mean verified.** This is the smallest honest demo of spec-agent's gate:
> the agent ships code that looks fine, the gate blocks it on a domain contract, the
> agent fixes it, the gate passes.

The project's contract (in `ledger.test.mjs`): **the commission ledger must be idempotent by `saleId`** — recording the same sale twice must not create a double payout.

## Run it

```bash
cd examples/idempotency-demo

# 1. the agent shipped this (a duplicate webhook double-pays):
cat ledger.mjs

# 2. the gate runs the project's contract:
npx @marcusbarcelos/spec-agent verify
#   SPEC-AGENT VERDICT: BLOCKED
#     ✗ domain contract   node --test
#         idempotency invariant failed: duplicate ledger entry for sale-1
#   Blocked: 1 check(s) failed. Fix and re-run `spec-agent verify`.

# 3. apply the fix (upsert by saleId instead of always appending):
```

```diff
  export function recordCommission(saleId, amount) {
-   entries.push({ saleId, amount });            // BUG: duplicates double-pay
+   const existing = entries.find((e) => e.saleId === saleId);
+   if (existing) return entries;                // idempotent: same saleId → no-op
+   entries.push({ saleId, amount });
    return entries;
  }
```

```bash
# 4. the gate passes — now "done" is real:
npx @marcusbarcelos/spec-agent verify
#   SPEC-AGENT VERDICT: PASSED
#     ✓ domain contract   node --test
#   Done means verified.
```

## Record the asciinema (for the README / landing)

```bash
cd examples/idempotency-demo
asciinema rec spec-agent-demo.cast \
  --title "spec-agent: done should mean verified" --idle-time-limit 1.5

# inside the recording, run, in order:
#   spec-agent verify            # → BLOCKED (idempotency invariant failed)
#   $EDITOR ledger.mjs           # apply the 3-line upsert fix above
#   spec-agent verify            # → PASSED (Done means verified.)
# then Ctrl-D to stop.

# publish:
asciinema upload spec-agent-demo.cast      # or render a gif with agg
```

The point in one line: **an agent without a gate is an overconfident junior. spec-agent is the automatic tech lead that says "No. This doesn't pass."**
