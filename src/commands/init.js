import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scaffoldProject } from "../scaffolder.js";
import { loadEngine } from "../projector/engine.js";
import { project } from "../projector/index.js";
import { lossReport } from "../capabilities.js";
import { writeFiles } from "../writer.js";

// Engine viaja DENTRO do pacote: src/commands -> repo root -> src/engine.
const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DEFAULT_ENGINE = join(PKG_ROOT, "src", "engine");

export async function runInit({ cwd, id, vendors, engineDir = DEFAULT_ENGINE }) {
  const engine = loadEngine(engineDir);
  const loss = {};
  for (const v of vendors) loss[v] = lossReport(v);
  // `checks` is the gate `spec-agent verify` runs — edit to fit your project.
  const manifest = { id, vendors, engine_version: "0.1.0", checks: [{ name: "tests", cmd: "npm test" }], loss_report: loss };
  scaffoldProject(cwd, manifest);
  for (const v of vendors) {
    const out = project(engine, manifest, v);
    writeFiles(cwd, out.files);
    writeFiles(cwd, out.skills);
  }
  return manifest;
}
