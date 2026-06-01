import { test, expect } from "vitest";
import { jaccard, isDuplicate, meetsThreshold } from "../src/utils/skill-candidates.js";

test("jaccard identical is 1", () => expect(jaccard("resolve human queue", "resolve human queue")).toBe(1));
test("jaccard disjoint is 0", () => expect(jaccard("abc def", "xyz uvw")).toBe(0));
test("jaccard near-duplicate > 0.6", () =>
  expect(jaccard("transfer ticket to human queue", "transfer ticket to the human queue")).toBeGreaterThan(0.6));
test("isDuplicate blocks near-dup", () =>
  expect(isDuplicate("transfer ticket to the human queue on cap", ["transfer ticket to human queue on cap"], 0.6)).toBe(true));
test("isDuplicate allows distinct", () =>
  expect(isDuplicate("transfer ticket to human queue", ["render markdown table"], 0.6)).toBe(false));
test("user-flag immediate", () =>
  expect(meetsThreshold({ occurrences: 1, distinctTasks: 1, daysSpan: 0, signal: "user-flag" })).toBe(true));
test("recurrence needs 3 + 2 tasks in window", () =>
  expect(meetsThreshold({ occurrences: 3, distinctTasks: 2, daysSpan: 10, signal: "pitfall" })).toBe(true));
test("recurrence below count fails", () =>
  expect(meetsThreshold({ occurrences: 2, distinctTasks: 2, daysSpan: 10, signal: "routing-miss" })).toBe(false));
test("recurrence outside window fails", () =>
  expect(meetsThreshold({ occurrences: 3, distinctTasks: 2, daysSpan: 45, signal: "procedimento" })).toBe(false));
