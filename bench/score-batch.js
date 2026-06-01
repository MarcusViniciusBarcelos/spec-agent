// Checa um lote de soluções in-environment: lê { taskId: solution } e roda o
// checker tamper-isolado de cada tarefa. Uso: node bench/score-batch.js <json>.
import { readFileSync } from "node:fs";
import { checkSolution } from "./check.js";

const file = process.argv[2];
if (!file) {
  console.error('uso: node bench/score-batch.js <solutions.json>\n  solutions.json = { "taskId": "<código da solução>", ... }');
  process.exit(1);
}
const sols = JSON.parse(readFileSync(file, "utf8"));
let pass = 0;
for (const [id, sol] of Object.entries(sols)) {
  let ok = false;
  try {
    ok = checkSolution(id, sol);
  } catch {
    ok = false;
  }
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}`);
}
console.log(`-- ${pass}/${Object.keys(sols).length} pass --`);
