import { test, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scaffoldProject } from "../src/scaffolder.js";

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "spec-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

test("scaffolds .spec tree and manifest", () => {
  const created = scaffoldProject(dir, { id: "my-app", vendors: ["claude"], engine_version: "0.1.0" });
  for (const p of [
    ".spec/manifest.yaml",
    ".spec/learning/INDEX.md",
    ".spec/learning/skill-candidates.md",
    ".spec/learning/_pending/.gitkeep",
    ".spec/skills/.gitkeep",
  ])
    expect(existsSync(join(dir, p)), p).toBe(true);
  expect(readFileSync(join(dir, ".spec/manifest.yaml"), "utf8")).toContain("id: my-app");
  expect(created.length).toBeGreaterThan(0);
});

test("does not clobber existing learning", () => {
  scaffoldProject(dir, { id: "x", vendors: [], engine_version: "0.1.0" });
  const f = join(dir, ".spec/learning/INDEX.md");
  writeFileSync(f, "USERDATA");
  scaffoldProject(dir, { id: "x", vendors: [], engine_version: "0.1.0" });
  expect(readFileSync(f, "utf8")).toBe("USERDATA");
});
