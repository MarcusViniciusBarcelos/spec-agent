// Capacidade -> status por vendor. native | degraded(fallback) | absent.
export const CAPABILITIES = {
  "cross-session-memory": {
    claude: { status: "native", provider: "claude-mem (enhancer)" },
    copilot: { status: "degraded", fallback: ".spec/learning files + native memory" },
    "agents-md": { status: "degraded", fallback: ".spec/learning files" },
  },
  "structured-workflows": {
    claude: { status: "native", provider: "superpowers (enhancer)" },
    copilot: { status: "degraded", fallback: "protocols inlined in rules" },
    "agents-md": { status: "degraded", fallback: "protocols inlined in rules" },
  },
  "multi-agent": {
    claude: { status: "native", provider: "subagents" },
    copilot: { status: "degraded", fallback: "single-thread simulation" },
    "agents-md": { status: "degraded", fallback: "single-thread simulation" },
  },
  "code-graph": {
    claude: { status: "native", provider: "graphify CLI" },
    copilot: { status: "native", provider: "graphify CLI" },
    "agents-md": { status: "native", provider: "graphify CLI" },
  },
  "verification-gate": {
    claude: { status: "native", provider: "Stop hook" },
    copilot: { status: "degraded", fallback: "git pre-commit / CI" },
    "agents-md": { status: "degraded", fallback: "git pre-commit / CI" },
  },
};

const VENDORS = ["claude", "copilot", "agents-md"];

export function resolveVendor(id) {
  if (!VENDORS.includes(id)) throw new Error(`unknown vendor: ${id}`);
  const out = {};
  for (const [cap, byVendor] of Object.entries(CAPABILITIES)) out[cap] = byVendor[id];
  return out;
}

export function lossReport(id) {
  const resolved = resolveVendor(id);
  return Object.entries(resolved)
    .filter(([, v]) => v.status !== "native")
    .map(([capability, v]) => ({ capability, status: v.status, fallback: v.fallback }));
}
