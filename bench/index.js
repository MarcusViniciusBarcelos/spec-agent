import { TASKS } from "./tasks/index.js";
import { runTask } from "./runner.js";
import { aggregate } from "./metrics.js";
import { renderReport } from "./report.js";

const CONDITIONS = ["baseline", "rules-only", "full-harness"];

export async function runBench({ tasks = TASKS, client, model, runs = 3, engineDir = "src/engine" }) {
  const results = [];
  for (const task of tasks)
    for (const condition of CONDITIONS)
      for (let r = 0; r < runs; r++) results.push(await runTask(task, condition, { client, model, engineDir }));
  const aggregated = aggregate(results);
  return { results, aggregated, report: renderReport(aggregated) };
}

// CLI entry — runner de API OPCIONAL (automação CI). NÃO é o caminho canônico.
// O benchmark canônico roda in-environment, sem API key: veja README + bench/check.js / bench/score-batch.js.
if (import.meta.url === `file://${process.argv[1]}`) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error(
      "[bench:api] runner OPCIONAL — requer ANTHROPIC_API_KEY.\n" +
        "O benchmark canônico roda no seu agente (vendor), sem API key: veja README (bench:score / check.js)."
    );
    process.exit(1);
  }
  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    console.error("[bench:api] instale a peer-dep opcional: npm i @anthropic-ai/sdk");
    process.exit(1);
  }
  const arg = (name, def) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : def);
  const model = arg("--model", "claude-sonnet-4-6");
  const runs = Number(arg("--runs", "3"));
  const client = new Anthropic({ apiKey: key });
  const { report } = await runBench({ client, model, runs });
  console.log(report.markdown);
}
