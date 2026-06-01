import { join } from "node:path";
import { readFileSync } from "node:fs";
import yaml from "js-yaml";

// The gate, runnable standalone (CI / PR). Reads `checks` from .spec/manifest.yaml;
// each check is { name, cmd }. `run(cmd, cwd)` returns { ok, detail } — injected so
// this stays a pure, testable function (the CLI wires a real command runner).
const DEFAULT_CHECKS = [{ name: "tests", cmd: "npm test" }];

export function runVerify({ cwd, run, checks }) {
  let list = checks;
  if (!list) {
    try {
      const m = yaml.load(readFileSync(join(cwd, ".spec/manifest.yaml"), "utf8"));
      list = m?.checks;
    } catch {
      /* no manifest — fall back to defaults */
    }
  }
  if (!list || !list.length) list = DEFAULT_CHECKS;

  const results = list.map((c) => {
    const r = run(c.cmd, cwd);
    return { name: c.name, cmd: c.cmd, ok: !!r.ok, detail: r.detail };
  });
  const failed = results.filter((r) => !r.ok);
  return { verdict: failed.length ? "BLOCKED" : "PASSED", results, failed };
}

// Human-readable verdict — reads like a code review, not a tool log.
export function renderVerdict({ verdict, results, failed }) {
  const out = [`SPEC-AGENT VERDICT: ${verdict}`, ""];
  for (const r of results) {
    out.push(`  ${r.ok ? "✓" : "✗"} ${r.name.padEnd(16)} ${r.cmd}`);
    if (!r.ok && r.detail) out.push(`      ${r.detail.replace(/\n/g, "\n      ")}`);
  }
  out.push("");
  out.push(
    verdict === "PASSED"
      ? "Done means verified."
      : `Blocked: ${failed.length} check(s) failed. Fix and re-run \`spec-agent verify\`.`
  );
  return out.join("\n");
}
