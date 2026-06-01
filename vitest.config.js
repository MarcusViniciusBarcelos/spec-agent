import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // examples/ ship their own runnable demos (node:test, not vitest) — don't collect them.
    exclude: ["node_modules/**", "examples/**"],
  },
});
