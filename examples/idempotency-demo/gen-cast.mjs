// Generates demo.cast — a pre-authored asciinema v2 replay of the REAL
// `spec-agent verify` output (BLOCKED → fix → PASSED), so you don't have to
// record a live session. The commands and verdicts are exactly what the CLI
// prints on examples/idempotency-demo (verified). Run: node gen-cast.mjs
import { writeFileSync } from "node:fs";

const lines = [];
lines.push(
  JSON.stringify({
    version: 2,
    width: 92,
    height: 22,
    timestamp: Math.floor(Date.now() / 1000),
    title: "spec-agent: done should mean verified",
    env: { SHELL: "/bin/zsh", TERM: "xterm-256color" },
  })
);

let t = 0;
const ev = (s, dt = 0.03) => {
  t = +(t + dt).toFixed(3);
  lines.push(JSON.stringify([t, "o", s]));
};
const type = (s) => [...s].forEach((c) => ev(c, 0.045));

const R = "\x1b[31m", G = "\x1b[32m", DIM = "\x1b[2m", C = "\x1b[36m", X = "\x1b[0m";
const PROMPT = `${G}➜${X}  ${C}idempotency-demo${X} $ `;

ev(PROMPT, 0.6);
type("spec-agent verify");
ev("\r\n", 0.45);
ev(`${R}SPEC-AGENT VERDICT: BLOCKED${X}\r\n\r\n`, 0.7);
ev(`  ${R}✗${X} domain contract  node --test\r\n`, 0.15);
ev(`      ${R}idempotency invariant failed: duplicate ledger entry for sale-1${X}\r\n\r\n`, 0.15);
ev(`${DIM}Blocked: 1 check(s) failed. Fix and re-run \`spec-agent verify\`.${X}\r\n`, 0.2);
ev(`\r\n${DIM}Run summary: 1 check · 1 blocked · 0 passed · 38ms${X}\r\n`, 0.2);

ev(PROMPT, 1.1);
type("# the agent fixes it — upsert by saleId instead of always appending");
ev("\r\n", 0.6);

ev(PROMPT, 0.5);
type("spec-agent verify");
ev("\r\n", 0.45);
ev(`${G}SPEC-AGENT VERDICT: PASSED${X}\r\n\r\n`, 0.7);
ev(`  ${G}✓${X} domain contract  node --test\r\n`, 0.2);
ev(`\r\n${G}Done means verified.${X}\r\n`, 0.2);
ev(`\r\n${DIM}Run summary: 1 check · 0 blocked · 1 passed · 35ms${X}\r\n`, 0.2);
ev(PROMPT, 1.4);

writeFileSync(new URL("./demo.cast", import.meta.url), lines.join("\n") + "\n");
console.log(`wrote demo.cast (${lines.length} lines, ~${t.toFixed(1)}s)`);
