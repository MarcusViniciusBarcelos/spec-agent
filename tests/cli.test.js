import { execFileSync } from "node:child_process";
import { test, expect } from "vitest";

test("CLI prints version", () => {
  const out = execFileSync("node", ["bin/spec-agent.js", "--version"], { encoding: "utf8" });
  expect(out.trim()).toMatch(/^\d+\.\d+\.\d+$/);
});
