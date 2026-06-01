import { test, expect } from "vitest";
import { execFileSync } from "node:child_process";

// Guard contra vazamento de nome de projeto privado no engine embarcado.
// O termo é configurável (não hardcodado, para o repo público não expor nomes):
//   SPEC_ENGINE_FORBIDDEN="meu-projeto-privado" npm test
const FORBIDDEN = process.env.SPEC_ENGINE_FORBIDDEN;

test.skipIf(!FORBIDDEN)("engine has no private-project leakage", () => {
  let hits = "";
  try { hits = execFileSync("grep", ["-rli", FORBIDDEN, "src/engine"], { encoding: "utf8" }); } catch {}
  expect(hits.trim()).toBe("");
});

test("engine ships the 4 governance skills", () => {
  for (const s of ["agent-council", "context-economy", "project-learning", "skill-forge"]) {
    expect(execFileSync("test", ["-f", `src/engine/skills/${s}/SKILL.md`])).toBeDefined();
  }
});
