import * as claude from "./vendors/claude.js";
import * as agentsmd from "./vendors/agents-md.js";
import * as copilot from "./vendors/copilot.js";

const VENDORS = { claude, "agents-md": agentsmd, copilot };

export function project(engine, manifest, vendorId) {
  const mod = VENDORS[vendorId];
  if (!mod) throw new Error(`no projector for vendor: ${vendorId}`);
  return mod.project(engine, manifest);
}
