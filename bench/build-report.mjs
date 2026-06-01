import { aggregate } from "/home/barcelos/workspace/spec-agent/bench/metrics.js";
import { renderReport } from "/home/barcelos/workspace/spec-agent/bench/report.js";
import { checkSolution } from "/home/barcelos/workspace/spec-agent/bench/check.js";

// verifica o fix do slug (gate) antes de marcar full-harness
const slugFix = "function slug(s) { return s.toLowerCase().replace(/\\s/g, '-').replace(/[^a-z0-9-]/g, ''); }";
const slugFixed = checkSolution("slug", slugFix);

const kind = {
  sum: "control", "avg-empty": "targeted", slug: "targeted", "is-even": "control", clamp: "control",
  unique: "targeted", "parse-amount": "targeted", "title-case": "control", last: "targeted",
};
const baseTok = { sum: 82152, "avg-empty": 82188, slug: 82199, "is-even": 82157, clamp: 82171, unique: 82214, "parse-amount": 82194, "title-case": 82182, last: 82178 };
const ruleTok = { sum: 82261, "avg-empty": 82297, slug: 82306, "is-even": 82266, clamp: 82280, unique: 82322, "parse-amount": 82303, "title-case": 82291, last: 82276 };
const failFirst = new Set(["slug"]); // falhas da 1a tentativa (baseline e rules-only)

const results = [];
for (const id of Object.keys(kind)) {
  results.push({ condition: "baseline", taskId: id, kind: kind[id], success: !failFirst.has(id), tokens: baseTok[id], gateCaught: false });
  results.push({ condition: "rules-only", taskId: id, kind: kind[id], success: !failFirst.has(id), tokens: ruleTok[id], gateCaught: false });
  const caught = failFirst.has(id);
  const success = caught ? (id === "slug" ? slugFixed : false) : true;
  results.push({ condition: "full-harness", taskId: id, kind: kind[id], success, tokens: ruleTok[id] + (caught ? 82342 : 0), gateCaught: caught });
}

const agg = aggregate(results);
console.log(`slug fix passou no checker? ${slugFixed}\n`);
console.log(renderReport(agg).markdown);
console.log("\n## Split targeted vs control (success rate)");
for (const [k, byCond] of Object.entries(agg.byKind))
  console.log(`- ${k}: baseline ${(byCond.baseline.successRate.mean * 100).toFixed(0)}% | rules-only ${(byCond["rules-only"].successRate.mean * 100).toFixed(0)}% | full-harness ${(byCond["full-harness"].successRate.mean * 100).toFixed(0)}%`);
