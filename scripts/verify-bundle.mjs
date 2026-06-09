import { access } from "node:fs/promises";

try {
  await access(new URL("../dist/action/index.js", import.meta.url));
} catch {
  console.error("dist/action/index.js is missing. Run npm run build:action.");
  process.exit(1);
}

console.log(
  "Action bundle exists. Reproducibility diff check runs in the Action slice.",
);
