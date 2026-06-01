import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

export function writeFiles(baseDir, files) {
  for (const f of files) {
    const p = join(baseDir, f.path);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, f.content);
  }
}
