import { test, expect } from "vitest";
import { loadEngine } from "../src/projector/engine.js";
import { project } from "../src/projector/index.js";

test("claude adapter includes engine rules + project id + skills install + loss", () => {
  const engine = loadEngine("src/engine");
  const out = project(engine, { id: "my-app", vendors: ["claude"] }, "claude");
  const claudeMd = out.files.find((f) => f.path === "CLAUDE.md");
  expect(claudeMd).toBeTruthy();
  expect(claudeMd.content).toContain("my-app");
  expect(claudeMd.content).toMatch(/context-economy/i);
  expect(claudeMd.content).toMatch(/GENERATED/);
  expect(out.skills.some((s) => s.path.startsWith(".claude/skills/agent-council"))).toBe(true);
  expect(Array.isArray(out.loss)).toBe(true);
});
