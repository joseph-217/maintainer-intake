import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const adapterDirs = ["src/cli", "src/mcp", "src/action", "src/github"];
const ruleIdPattern = /MI-(?:PR|ISSUE|SYS)-[A-Z0-9-]+/g;
const failures = [];

for (const dir of adapterDirs) {
  for await (const file of walk(join(root, dir))) {
    const text = await readFile(file, "utf8");
    const matches = text.match(ruleIdPattern);
    if (matches) {
      failures.push(
        file +
          " contains engine rule ID(s): " +
          [...new Set(matches)].join(", "),
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

async function* walk(path) {
  let entries;
  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) {
      yield* walk(entryPath);
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      yield entryPath;
    }
  }
}
