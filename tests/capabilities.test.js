import { test, expect } from "vitest";
import { resolveVendor, lossReport } from "../src/capabilities.js";

test("claude has native multi-agent", () => {
  expect(resolveVendor("claude")["multi-agent"].status).toBe("native");
});
test("copilot degrades multi-agent to single-thread", () => {
  const c = resolveVendor("copilot")["multi-agent"];
  expect(c.status).toBe("degraded");
  expect(c.fallback).toMatch(/single-thread/i);
});
test("lossReport lists degraded/absent only", () => {
  const losses = lossReport("copilot");
  expect(losses.every((l) => l.status !== "native")).toBe(true);
  expect(losses.find((l) => l.capability === "multi-agent")).toBeTruthy();
});
test("unknown vendor throws", () => {
  expect(() => resolveVendor("nope")).toThrow();
});
