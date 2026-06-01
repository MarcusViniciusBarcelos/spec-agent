import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";
import { loadEngine } from "../projector/engine.js";
import { project } from "../projector/index.js";
import { lossReport } from "../capabilities.js";
import { writeFiles } from "../writer.js";
import { DEFAULT_ENGINE } from "./init.js";

export async function runSync({ cwd, engineDir = DEFAULT_ENGINE, agents = [] }) {
  const manifestPath = join(cwd, ".spec/manifest.yaml");
  const manifest = yaml.load(readFileSync(manifestPath, "utf8"));

  // --agents adiciona novos agentes de código ao projeto (união, dedupe) e persiste o manifest.
  const added = agents.filter((a) => !manifest.vendors.includes(a));
  if (added.length) {
    const addedLoss = {};
    for (const a of added) addedLoss[a] = lossReport(a); // valida (throw em agente desconhecido) antes de persistir
    manifest.vendors = [...manifest.vendors, ...added];
    manifest.loss_report = { ...(manifest.loss_report ?? {}), ...addedLoss };
    writeFileSync(manifestPath, yaml.dump(manifest));
  }

  const engine = loadEngine(engineDir);
  for (const v of manifest.vendors) {
    const out = project(engine, manifest, v);
    writeFiles(cwd, out.files); // só adapters GENERATED + engine skills
    writeFiles(cwd, out.skills);
  }
  return manifest; // nunca toca .spec/learning nem .spec/skills
}
