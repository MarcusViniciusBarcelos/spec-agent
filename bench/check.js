// Ground-truth tamper-isolated: roda o checker de uma tarefa na solução produzida
// por um agente (subagent do vendor). O agente nunca vê este arquivo.
// Uso: node bench/check.js <taskId> <solutionFile>  -> imprime PASS|FAIL, exit 0|1.
import { readFileSync } from "node:fs";
import { TASKS } from "./tasks/index.js";
import { extractSolution } from "./extract.js";

export function checkSolution(taskId, rawText) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) throw new Error(`unknown task: ${taskId}`);
  return !!task.checker(extractSolution(rawText));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [taskId, solutionFile] = process.argv.slice(2);
  if (!taskId || !solutionFile) {
    console.error("uso: node bench/check.js <taskId> <solutionFile>");
    process.exit(2);
  }
  let passed;
  try {
    passed = checkSolution(taskId, readFileSync(solutionFile, "utf8"));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  console.log(passed ? "PASS" : "FAIL");
  process.exit(passed ? 0 : 1);
}
