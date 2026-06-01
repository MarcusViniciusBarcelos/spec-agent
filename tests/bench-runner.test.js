import { test, expect } from "vitest";
import { runTask } from "../bench/runner.js";

const task = {
  id: "sum",
  kind: "control",
  prompt: "sum",
  solutionContract: "function sum",
  checker: (s) => s.includes("a+b"),
};

function mockClient(texts) {
  let i = 0;
  return {
    messages: {
      create: async () => ({
        content: [{ type: "text", text: texts[Math.min(i++, texts.length - 1)] }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    },
  };
}

test("baseline: ships first attempt, success from checker", async () => {
  const r = await runTask(task, "baseline", { client: mockClient(["```js\nreturn a+b\n```"]), model: "m" });
  expect(r.success).toBe(true);
  expect(r.tokens).toBe(15);
  expect(r.gateCaught).toBe(false);
});
test("full-harness: first fails, gate fix passes -> success + gateCaught + 2x tokens", async () => {
  const client = mockClient(["bad", "```js\nreturn a+b\n```"]);
  const r = await runTask(task, "full-harness", { client, model: "m" });
  expect(r.success).toBe(true);
  expect(r.gateCaught).toBe(true);
  expect(r.tokens).toBe(30);
});
