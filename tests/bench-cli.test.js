import { test, expect } from "vitest";
import { runBench } from "../bench/index.js";

const tasks = [{ id: "t", kind: "control", prompt: "p", solutionContract: "x", checker: (s) => s === "OK" }];
const client = {
  messages: {
    create: async () => ({ content: [{ type: "text", text: "OK" }], usage: { input_tokens: 1, output_tokens: 1 } }),
  },
};

test("runBench runs all conditions x runs and returns a report", async () => {
  const { aggregated, report } = await runBench({ tasks, client, model: "m", runs: 2, engineDir: "src/engine" });
  expect(aggregated.byCondition.baseline.n).toBe(2);
  expect(aggregated.byCondition["rules-only"].n).toBe(2);
  expect(aggregated.byCondition["full-harness"].n).toBe(2);
  expect(report.markdown).toMatch(/success/i);
});
