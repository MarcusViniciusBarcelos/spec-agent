import { test, expect } from "vitest";
import { loadEngine } from "../src/projector/engine.js";
import { project } from "../src/projector/index.js";

const engine = loadEngine("src/engine");

test("agents-md writes AGENTS.md with inlined skill protocols + loss", () => {
  const out = project(engine, { id: "app", vendors: ["agents-md"] }, "agents-md");
  const f = out.files.find((x) => x.path === "AGENTS.md");
  expect(f.content).toMatch(/agent-council/i);
  expect(out.skills.length).toBe(0);
  expect(out.loss.find((l) => l.capability === "multi-agent")).toBeTruthy();
});

test("copilot writes .github/copilot-instructions.md", () => {
  const out = project(engine, { id: "app", vendors: ["copilot"] }, "copilot");
  expect(out.files.find((x) => x.path === ".github/copilot-instructions.md")).toBeTruthy();
});
