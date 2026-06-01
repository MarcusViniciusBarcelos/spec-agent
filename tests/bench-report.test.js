import { test, expect } from "vitest";
import { renderReport } from "../bench/report.js";

const agg = {
  byCondition: {
    baseline: { n: 4, successRate: { mean: 0.5, stddev: 0.1 }, tokens: { mean: 100, stddev: 5 }, gateCatchRate: 0 },
    "full-harness": { n: 4, successRate: { mean: 0.9, stddev: 0.1 }, tokens: { mean: 250, stddev: 8 }, gateCatchRate: 0.4 },
  },
  byKind: {},
};

test("report has a table, the honest note, and valid json", () => {
  const { markdown, json } = renderReport(agg);
  expect(markdown).toMatch(/success/i);
  expect(markdown).toMatch(/honest|honesto|custou mais|não ajudou/i);
  expect(JSON.parse(json).byCondition.baseline.successRate.mean).toBe(0.5);
});
