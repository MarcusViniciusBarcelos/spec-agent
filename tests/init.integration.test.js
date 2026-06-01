import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInit } from "../src/commands/init.js";

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "spec-init-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

test("init creates .spec, adapters, skills and loss_report", async () => {
  await runInit({ cwd: dir, id: "my-app", vendors: ["claude", "agents-md"], engineDir: "src/engine" });
  expect(existsSync(join(dir, ".spec/manifest.yaml"))).toBe(true);
  expect(existsSync(join(dir, "CLAUDE.md"))).toBe(true);
  expect(existsSync(join(dir, "AGENTS.md"))).toBe(true);
  expect(existsSync(join(dir, ".claude/skills/agent-council/SKILL.md"))).toBe(true);
  const manifest = readFileSync(join(dir, ".spec/manifest.yaml"), "utf8");
  expect(manifest).toContain("loss_report");
});
