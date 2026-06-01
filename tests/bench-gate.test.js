import { test, expect } from "vitest";
import { runGate } from "../bench/gate.js";

const checker = (sol) => sol === "GOOD";

test("first attempt passes -> no gate-catch", async () => {
  const r = await runGate("GOOD", checker, async () => "GOOD");
  expect(r).toEqual({ passed: true, gateCaught: false, iterations: 1 });
});
test("first fails, fix passes -> gate-catch + recovered", async () => {
  const r = await runGate("BAD", checker, async () => "GOOD");
  expect(r).toEqual({ passed: true, gateCaught: true, iterations: 2 });
});
test("first fails, fix also fails -> gate-catch, not recovered", async () => {
  const r = await runGate("BAD", checker, async () => "STILL_BAD");
  expect(r).toEqual({ passed: false, gateCaught: true, iterations: 2 });
});
