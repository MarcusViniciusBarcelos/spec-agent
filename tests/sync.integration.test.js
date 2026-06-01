import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import yaml from "js-yaml";
import { runInit } from "../src/commands/init.js";
import { runSync } from "../src/commands/sync.js";

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "spec-sync-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

test("sync re-projects adapters but preserves durable learning", async () => {
  await runInit({ cwd: dir, id: "app", vendors: ["claude"], engineDir: "src/engine" });
  const learn = join(dir, ".spec/learning/INDEX.md");
  writeFileSync(learn, "USER LEARNING");
  writeFileSync(join(dir, "CLAUDE.md"), "STALE");
  await runSync({ cwd: dir, engineDir: "src/engine" });
  expect(readFileSync(learn, "utf8")).toBe("USER LEARNING");
  expect(readFileSync(join(dir, "CLAUDE.md"), "utf8")).toMatch(/GENERATED/);
});

test("sync --agents adds a coding agent post-init and projects its adapter", async () => {
  await runInit({ cwd: dir, id: "app", vendors: ["claude"], engineDir: "src/engine" });
  writeFileSync(join(dir, ".spec/learning/INDEX.md"), "USER LEARNING");
  await runSync({ cwd: dir, engineDir: "src/engine", agents: ["agents-md"] });
  const manifest = yaml.load(readFileSync(join(dir, ".spec/manifest.yaml"), "utf8"));
  expect(manifest.vendors).toEqual(["claude", "agents-md"]);
  expect(manifest.loss_report["agents-md"]).toBeDefined();
  expect(readFileSync(join(dir, "AGENTS.md"), "utf8")).toMatch(/agent-council/i);
  expect(readFileSync(join(dir, ".spec/learning/INDEX.md"), "utf8")).toBe("USER LEARNING");
});

test("sync --agents is idempotent and dedupes existing agents", async () => {
  await runInit({ cwd: dir, id: "app", vendors: ["claude"], engineDir: "src/engine" });
  await runSync({ cwd: dir, engineDir: "src/engine", agents: ["claude", "agents-md"] });
  await runSync({ cwd: dir, engineDir: "src/engine", agents: ["agents-md"] });
  const manifest = yaml.load(readFileSync(join(dir, ".spec/manifest.yaml"), "utf8"));
  expect(manifest.vendors).toEqual(["claude", "agents-md"]);
});
