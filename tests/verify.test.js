import { test, expect } from "vitest";
import { runVerify, renderVerdict } from "../src/commands/verify.js";

test("verify BLOCKS when a check fails and names the reason", () => {
  const run = (cmd) =>
    cmd.includes("test") ? { ok: false, detail: "idempotency invariant failed: duplicate ledger entry for sale-1" } : { ok: true };
  const r = runVerify({ cwd: ".", checks: [{ name: "domain contract", cmd: "node --test" }], run });
  expect(r.verdict).toBe("BLOCKED");
  expect(r.failed).toHaveLength(1);
  const out = renderVerdict(r);
  expect(out).toMatch(/VERDICT: BLOCKED/);
  expect(out).toMatch(/idempotency invariant failed/);
  expect(out).toMatch(/re-run `spec-agent verify`/);
  expect(out).toMatch(/Run summary: 1 check · 1 blocked · 0 passed/);
});

test("verify PASSES when all checks pass", () => {
  const run = () => ({ ok: true });
  const r = runVerify({ cwd: ".", checks: [{ name: "tests", cmd: "npm test" }], run });
  expect(r.verdict).toBe("PASSED");
  expect(renderVerdict(r)).toMatch(/Done means verified/);
});

test("verify falls back to default checks when none are configured", () => {
  const seen = [];
  const run = (cmd) => {
    seen.push(cmd);
    return { ok: true };
  };
  runVerify({ cwd: "/nonexistent-path-no-manifest", run });
  expect(seen).toEqual(["npm test"]);
});
