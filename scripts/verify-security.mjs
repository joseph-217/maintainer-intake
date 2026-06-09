import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const scanRoots = [
  join(root, ".github", "workflows"),
  join(root, "src", "action"),
];
const findings = [];

for (const dir of scanRoots) {
  for await (const file of walk(dir)) {
    const text = await readFile(file, "utf8");
    if (/pull_request_target/.test(text) && /actions\/checkout/.test(text)) {
      findings.push(
        file + ": privileged workflow must not use actions/checkout",
      );
    }
    if (
      /pull_request_target/.test(text) &&
      /npm\s+(ci|install|test)|yarn\s+install|pnpm\s+install/.test(text)
    ) {
      findings.push(
        file +
          ": privileged path must not execute contributor dependency or test commands",
      );
    }
    if (
      /GITHUB_TOKEN|GH_TOKEN/.test(text) &&
      /console\.log\([^)]*(token|authorization|header)/i.test(text)
    ) {
      findings.push(file + ": possible token logging");
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
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
    } else if (/\.(yml|yaml|ts|js|mjs)$/.test(entry.name)) {
      yield entryPath;
    }
  }
}
