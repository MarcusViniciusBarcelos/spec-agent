import { test, expect } from "vitest";
import { extractSolution } from "../bench/extract.js";
import { TASKS } from "../bench/tasks/index.js";

test("extractSolution strips a js code fence", () => {
  expect(extractSolution("blah\n```js\nfunction f(){return 1}\n```\nend")).toBe("function f(){return 1}");
});
test("extractSolution returns trimmed text when no fence", () => {
  expect(extractSolution("  function f(){}  ")).toBe("function f(){}");
});
test("every task has id/kind/prompt/solutionContract/checker", () => {
  for (const t of TASKS) {
    expect(typeof t.id).toBe("string");
    expect(["targeted", "control"]).toContain(t.kind);
    expect(typeof t.prompt).toBe("string");
    expect(typeof t.solutionContract).toBe("string");
    expect(typeof t.checker).toBe("function");
  }
});
test("a correct sum solution passes its checker; a wrong one fails", () => {
  const sum = TASKS.find((t) => t.id === "sum");
  expect(sum.checker("function sum(a,b){return a+b}")).toBe(true);
  expect(sum.checker("function sum(a,b){return a-b}")).toBe(false);
});
test("empty-handling targeted checker catches the empty-list footgun", () => {
  const t = TASKS.find((x) => x.id === "avg-empty");
  expect(t.checker("function avg(xs){return xs.length? xs.reduce((a,b)=>a+b,0)/xs.length : 0}")).toBe(true);
  expect(t.checker("function avg(xs){return xs.reduce((a,b)=>a+b,0)/xs.length}")).toBe(false);
});
