import { test, expect } from "vitest";
import { aggregate } from "../bench/metrics.js";

const results = [
  { condition: "baseline", kind: "control", success: true, tokens: 10, gateCaught: false },
  { condition: "baseline", kind: "control", success: false, tokens: 20, gateCaught: false },
  { condition: "full-harness", kind: "targeted", success: true, tokens: 40, gateCaught: true },
];

test("aggregate computes successRate, tokens mean, gateCatchRate per condition", () => {
  const a = aggregate(results);
  expect(a.byCondition.baseline.successRate.mean).toBe(0.5);
  expect(a.byCondition.baseline.tokens.mean).toBe(15);
  expect(a.byCondition["full-harness"].gateCatchRate).toBe(1);
  expect(a.byCondition.baseline.n).toBe(2);
});
