import { test, expect } from "vitest";
import { BASELINE_PROMPT, buildRulesPrompt } from "../bench/harness-prompt.js";

test("baseline prompt is minimal (no harness rules)", () => {
  expect(BASELINE_PROMPT).toMatch(/engenheiro|engineer|código|code/i);
  expect(BASELINE_PROMPT).not.toMatch(/context-economy|council/i);
});
test("rules prompt embeds engine rule content", () => {
  const p = buildRulesPrompt("src/engine");
  expect(p).toMatch(/context-economy/i);
  expect(p.length).toBeGreaterThan(BASELINE_PROMPT.length);
});
